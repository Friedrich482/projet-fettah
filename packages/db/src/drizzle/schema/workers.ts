import { pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { WORKERS_STATUSES } from "@repo/common/constants";

import { timestamps } from "./columns.helpers";

export const workerStatusEnum = pgEnum("workers_status", WORKERS_STATUSES);

export const workers = pgTable("workers", {
  id: varchar("id", { length: 26 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid().toLowerCase()),

  name: text("name").notNull().unique(),
  status: workerStatusEnum("status").notNull().default("offline"),
  lastHeartbeatAt: timestamp("last_heartbeat_at"),
  ...timestamps,
});
