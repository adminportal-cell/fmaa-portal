import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, usersTable, approvedMembersTable, type User } from "@workspace/db";

async function isEmailApproved(email: string): Promise<boolean> {
  if (!email) return false;
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

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (existing) {
    const desiredTier = existing.role === "admin"
      ? existing.tier
      : approved
        ? "premium"
        : "standard";
    if (
      existing.email !== email ||
      existing.name !== name ||
      existing.avatarUrl !== (clerkUser.imageUrl ?? null) ||
      existing.tier !== desiredTier
    ) {
      const [updated] = await db
        .update(usersTable)
        .set({
          email,
          name,
          avatarUrl: clerkUser.imageUrl ?? null,
          tier: desiredTier,
        })
        .where(eq(usersTable.id, userId))
        .returning();
      return updated!;
    }
    return existing;
  }

  const [created] = await db
    .insert(usersTable)
    .values({
      id: userId,
      email,
      name,
      avatarUrl: clerkUser.imageUrl ?? null,
      tier: approved ? "premium" : "standard",
    })
    .returning();
  return created!;
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
