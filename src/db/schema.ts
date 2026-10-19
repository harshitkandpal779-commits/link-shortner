import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";

export const links = pgTable(
  "links",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 64 }).notNull().unique(),
    url: text("url").notNull(),
    clicks: integer("clicks").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastVisitedAt: timestamp("last_visited_at", { withTimezone: true }),
  },
  (table) => ({
    createdIdx: index("links_created_at_idx").on(table.createdAt),
  }),
);

export const clicks = pgTable(
  "clicks",
  {
    id: serial("id").primaryKey(),
    linkId: integer("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    linkIdx: index("clicks_link_id_idx").on(table.linkId),
  }),
);

export type Link = typeof links.$inferSelect;
export type Click = typeof clicks.$inferSelect;
