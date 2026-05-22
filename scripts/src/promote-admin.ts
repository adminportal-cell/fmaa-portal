import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function main(): Promise<void> {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: pnpm --filter @workspace/scripts exec tsx src/promote-admin.ts <email>");
    process.exit(1);
  }
  const [row] = await db
    .update(usersTable)
    .set({ role: "admin", tier: "premium" })
    .where(eq(usersTable.email, email))
    .returning();
  if (!row) {
    console.error(`No user found with email ${email}. They must sign in once first.`);
    process.exit(1);
  }
  console.log(`Promoted ${row.email} to admin.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
