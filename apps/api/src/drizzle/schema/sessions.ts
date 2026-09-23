import { index, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { timestamps } from "./columns.helpers";
import { users } from "./users";

export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 26 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid().toLowerCase()),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [index("sessions_userId_idx").on(table.userId)],
);
