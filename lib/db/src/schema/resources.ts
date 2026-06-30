import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const resourcesTable = pgTable("resources", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  categories: text("categories").array().notNull().default([]),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array().notNull().default([]),
  fileUrl: text("file_url"),
  coverImageUrl: text("cover_image_url"),
  readingMinutes: integer("reading_minutes"),
  isPremium: boolean("is_premium").notNull().default(false),
  authorName: text("author_name").notNull().default("FMAA"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Resource = typeof resourcesTable.$inferSelect;
export type InsertResource = typeof resourcesTable.$inferInsert;
