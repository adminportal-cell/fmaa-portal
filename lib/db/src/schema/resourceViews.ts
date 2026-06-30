import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { resourcesTable } from "./resources";
import { usersTable } from "./users";

export const resourceViewsTable = pgTable(
  "resource_views",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    resourceId: integer("resource_id")
      .notNull()
      .references(() => resourcesTable.id, { onDelete: "cascade" }),
    firstViewedAt: timestamp("first_viewed_at").notNull().defaultNow(),
    lastViewedAt: timestamp("last_viewed_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.resourceId] })],
);
