import { Router, type IRouter } from "express";
import { clerkClient } from "@clerk/express";
import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { db, approvedMembersTable, usersTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth";
import {
  AddApprovedMembersBody,
  DeleteApprovedMemberParams,
} from "@workspace/api-zod";
import type { Logger } from "pino";

const router: IRouter = Router();

// Pre-create a Clerk account for each approved email so members can sign in
// directly with their email (via emailed code) without ever needing a
// sign-up step. Safe to call repeatedly: existing accounts are skipped.
// Returns the emails for which account creation failed.
async function ensureClerkAccounts(
  emails: string[],
  log: Logger,
): Promise<string[]> {
  const failed: string[] = [];
  for (const email of emails) {
    try {
      const existing = await clerkClient.users.getUserList({
        emailAddress: [email],
        limit: 1,
      });
      if (existing.data.length > 0) continue;
      await clerkClient.users.createUser({
        emailAddress: [email],
        skipPasswordRequirement: true,
      });
      log.info({ email }, "pre-created Clerk account for approved member");
    } catch (err) {
      failed.push(email);
      log.warn({ err, email }, "failed to pre-create Clerk account");
    }
  }
  return failed;
}

function parseEmails(input: string | string[]): string[] {
  const text = Array.isArray(input) ? input.join("\n") : input;
  return Array.from(
    new Set(
      text
        .split(/[\s,;]+/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)),
    ),
  );
}

router.get(
  "/admin/approved-members",
  requireAuth,
  requireAdmin,
  async (req, res): Promise<void> => {
    const rows = await db
      .select()
      .from(approvedMembersTable)
      .orderBy(desc(approvedMembersTable.createdAt));
    res.json(
      rows.map((r) => ({
        email: r.email,
        note: r.note ?? null,
        addedBy: r.addedBy ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
    );
    // Backfill: make sure every approved email that has never signed in
    // (still has a pending placeholder) has a Clerk account. Runs in the
    // background so the list loads instantly.
    if (rows.length === 0) return;
    const pending = await db
      .select({ email: usersTable.email })
      .from(usersTable)
      .where(
        inArray(
          usersTable.id,
          rows.map((r) => `pending:${r.email}`),
        ),
      );
    if (pending.length > 0) {
      void ensureClerkAccounts(
        pending.map((p) => p.email),
        req.log,
      );
    }
  },
);

router.post(
  "/admin/approved-members",
  requireAuth,
  requireAdmin,
  async (req, res): Promise<void> => {
    const parsed = AddApprovedMembersBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const emails = parseEmails(parsed.data.emails);
    if (emails.length === 0) {
      res.status(400).json({ error: "No valid emails provided" });
      return;
    }
    const addedBy = req.currentUser?.email ?? null;
    const note = parsed.data.note ?? null;

    await db
      .insert(approvedMembersTable)
      .values(emails.map((email) => ({ email, note, addedBy })))
      .onConflictDoNothing();

    await db
      .update(usersTable)
      .set({ tier: "premium" })
      .where(and(inArray(usersTable.email, emails), ne(usersTable.role, "admin")));

    // Pre-create member rows so newly approved emails show up under "Accesses"
    // immediately (before they sign in). A placeholder id is used and is
    // reconciled to the real Clerk id on first sign-in (see requireAuth).
    const existingUsers = await db
      .select({ email: usersTable.email })
      .from(usersTable)
      .where(inArray(usersTable.email, emails));
    const existingEmails = new Set(existingUsers.map((u) => u.email));
    const pendingRows = emails
      .filter((email) => !existingEmails.has(email))
      .map((email) => ({
        id: `pending:${email}`,
        email,
        role: "member",
        tier: "premium",
      }));
    if (pendingRows.length > 0) {
      await db.insert(usersTable).values(pendingRows).onConflictDoNothing();
    }

    const provisionFailed = await ensureClerkAccounts(emails, req.log);

    res.status(201).json({ added: emails.length, emails, provisionFailed });
  },
);

router.delete(
  "/admin/approved-members/:email",
  requireAuth,
  requireAdmin,
  async (req, res): Promise<void> => {
    const parsed = DeleteApprovedMemberParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const email = parsed.data.email.toLowerCase();
    const [row] = await db
      .delete(approvedMembersTable)
      .where(eq(approvedMembersTable.email, email))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Approved member not found" });
      return;
    }
    // Remove the placeholder member row if they never signed in.
    await db.delete(usersTable).where(eq(usersTable.id, `pending:${email}`));
    res.sendStatus(204);
  },
);

export default router;
