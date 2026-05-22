import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const approvedMembersTable = pgTable("approved_members", {
  email: text("email").primaryKey(),
  note: text("note"),
  addedBy: text("added_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ApprovedMember = typeof approvedMembersTable.$inferSelect;
export type InsertApprovedMember = typeof approvedMembersTable.$inferInsert;
