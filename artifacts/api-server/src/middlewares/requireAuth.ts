import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, usersTable, approvedMembersTable, type User } from "@workspace/db";

const PRE_AUTHORIZED_ADMINS = new Set([
  "adminportal@fmaa.com.au",
  "bridget.davis@fmaa.com.au",
]);

async function isEmailApproved(email: string): Promise<boolean> {
  if (!email) return false;
  if (PRE_AUTHORIZED_ADMINS.has(email.toLowerCase())) return true;
  const [row] = await db
    .select()
    .from(approvedMembersTable)
    .where(eq(approvedMembersTable.email, email.toLowerCase()));
  return Boolean(row);
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      currentUser?: User;
    }
  }
}

/** Thrown when a signed-in user's email is not on the approved-members list. */
class NotApprovedError extends Error {
  constructor(email: string) {
    super(`Email not on approved list: ${email}`);
    this.name = "NotApprovedError";
  }
}

async function jitProvisionUser(userId: string): Promise<User> {
  const clerkUser = await clerkClient.users.getUser(userId);
  const email = (
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    ""
  ).toLowerCase();
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    clerkUser.username ||
    email.split("@")[0] ||
    "Member";

  const approved = await isEmailApproved(email);
  const isPreAuthorizedAdmin = PRE_AUTHORIZED_ADMINS.has(email);

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (existing) {
    // Everyone with access is premium, so approval is the gate: unapproved
    // non-admin accounts are rejected outright instead of being downgraded.
    if (!approved && !isPreAuthorizedAdmin && existing.role !== "admin") {
      throw new NotApprovedError(email);
    }
    const desiredRole = isPreAuthorizedAdmin ? "admin" : existing.role;
    const desiredTier = "premium";
    if (
      existing.email !== email ||
      existing.name !== name ||
      existing.avatarUrl !== (clerkUser.imageUrl ?? null) ||
      existing.tier !== desiredTier ||
      existing.role !== desiredRole
    ) {
      const [updated] = await db
        .update(usersTable)
        .set({
          email,
          name,
          avatarUrl: clerkUser.imageUrl ?? null,
          tier: desiredTier,
          role: desiredRole,
        })
        .where(eq(usersTable.id, userId))
        .returning();
      return updated!;
    }
    return existing;
  }

  // No row matched by Clerk id. A pre-created placeholder row may exist for this
  // email (added via the approved-members admin flow). Adopt it by swapping in
  // the real Clerk id so we don't create a duplicate member. Restrict strictly
  // to the placeholder row (id = `pending:<email>`) — never match by email alone,
  // since users.email is not unique and the resource_views FK has no
  // ON UPDATE CASCADE, so mutating a real account's PK could fail or orphan rows.
  const placeholderId = `pending:${email}`;
  const [pending] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, placeholderId));
  if (pending) {
    if (!approved && !isPreAuthorizedAdmin && pending.role !== "admin") {
      throw new NotApprovedError(email);
    }
    const desiredRole = isPreAuthorizedAdmin ? "admin" : pending.role;
    const desiredTier = "premium";
    const [adopted] = await db
      .update(usersTable)
      .set({
        id: userId,
        email,
        name,
        avatarUrl: clerkUser.imageUrl ?? null,
        role: desiredRole,
        tier: desiredTier,
      })
      .where(eq(usersTable.id, placeholderId))
      .returning();
    if (adopted) return adopted;
    // Lost a race: a concurrent sign-in already adopted the placeholder.
    const [now] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (now) return now;
  }

  if (!approved && !isPreAuthorizedAdmin) {
    throw new NotApprovedError(email);
  }

  const [created] = await db
    .insert(usersTable)
    .values({
      id: userId,
      email,
      name,
      avatarUrl: clerkUser.imageUrl ?? null,
      role: isPreAuthorizedAdmin ? "admin" : "member",
      tier: "premium",
    })
    .onConflictDoNothing({ target: usersTable.id })
    .returning();
  if (created) return created;
  // Lost a race: a concurrent request (e.g. /api/me and /api/dashboard/summary
  // firing in parallel on first sign-in) already inserted this user.
  const [row] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (row) return row;
  throw new Error(`Failed to provision user ${userId}`);
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.["userId"] as string | undefined || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const user = await jitProvisionUser(userId);
    req.userId = userId;
    req.currentUser = user;
    next();
  } catch (err) {
    if (err instanceof NotApprovedError) {
      req.log.warn({ err }, "Rejected sign-in from unapproved email");
      res.status(403).json({
        error: "Your email is not on the approved members list.",
        code: "not_approved",
      });
      return;
    }
    req.log.error({ err }, "Failed to provision user");
    res.status(500).json({ error: "Failed to load user" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.currentUser || req.currentUser.role !== "admin") {
    res.status(403).json({ error: "Forbidden — admins only" });
    return;
  }
  next();
}
