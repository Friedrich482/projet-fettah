import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { RESERVATION_STATUSES } from "@repo/common/constants";

import { timestamps } from "./columns.helpers";
import { users } from "./users";

export const reservationStatusEnum = pgEnum(
  "reservation_status",
  RESERVATION_STATUSES,
);

export const reservations = pgTable(
  "reservations",
  {
    id: varchar("id", { length: 26 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid().toLowerCase()),
    userId: varchar("user_id", { length: 26 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    status: reservationStatusEnum("status").notNull(),
    duration: integer("duration").notNull(),
    expiresAt: timestamp("expires_at"),
    endedAt: timestamp("ended_at"),
    ...timestamps,
  },
  (table) => [
    index("reservations_userId_idx").on(table.userId),
    check("duration_strictly_positive", sql`${table.duration} > 0`),
  ],
);
