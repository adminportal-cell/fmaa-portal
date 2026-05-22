import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const alumniProfilesTable = pgTable("alumni_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  company: text("company").notNull(),
  industry: text("industry").notNull(),
  gradYear: integer("grad_year").notNull(),
  insight: text("insight").notNull(),
  headshotUrl: text("headshot_url"),
  linkedinUrl: text("linkedin_url"),
  location: text("location"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AlumniProfile = typeof alumniProfilesTable.$inferSelect;
export type InsertAlumniProfile = typeof alumniProfilesTable.$inferInsert;
