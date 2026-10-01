import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { MACHINES_STATUSES } from "@repo/common/constants";

import { timestamps } from "./columns.helpers";
import { images } from "./images";
import { reservations } from "./reservations";
import { workers } from "./workers";

export const machineStatusEnum = pgEnum("machine_status", MACHINES_STATUSES);

export const machines = pgTable(
  "machines",
  {
    id: varchar("id", { length: 26 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid().toLowerCase()),
    reservationId: varchar("reservation_id", { length: 26 })
      .notNull()
      .references(() => reservations.id, { onDelete: "cascade" }),
    imageId: varchar("image_id", { length: 26 })
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
    workerId: varchar("worker_id", { length: 26 }).references(
      () => workers.id,
      {
        onDelete: "set null",
      },
    ),

    name: text("name").notNull().unique(),
    cpu: integer("cpu").notNull(),
    ram: integer("ram").notNull(),
    status: machineStatusEnum("status").notNull(),
    containerId: text("container_id").unique(),
    sshUsername: text("ssh_username").notNull().default("root"),
    sshPassword: text("ssh_password"),
    sshPort: integer("ssh_port"),
    lastError: text("last_error"),
    destroyedAt: timestamp("destroyed_at"),
    ...timestamps,
  },
  (table) => [
    index("machines_reservationId_idx").on(table.reservationId),
    index("machines_imageId_idx").on(table.imageId),
    index("machines_workerId_idx").on(table.workerId),

    check("cpu_strictly_positive", sql`${table.cpu} > 0`),
    check("ram_strictly_positive", sql`${table.ram} > 0`),
  ],
);
