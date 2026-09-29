import { bigint, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { timestamps } from "./columns.helpers";

export const rate_limits = pgTable("rate_limits", {
  id: varchar("id", { length: 26 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid().toLowerCase()),

  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
  ...timestamps,
});
