import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgTable,
  text,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { timestamps } from "./columns.helpers";

export const images = pgTable(
  "images",
  {
    id: varchar("id", { length: 26 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => ulid().toLowerCase()),

    name: text("name").notNull(),
    tag: text("tag").notNull(),
    digest: text("digest"),
    exposedPort: integer("exposed_port").notNull(),
    defaultCpu: integer("default_cpu").notNull(),
    defaultRam: integer("default_ram").notNull(),
    ...timestamps,
  },
  (table) => [
    check("default_cpu_strictly_positive", sql`${table.defaultCpu} > 0`),
    check("default_ram_strictly_positive", sql`${table.defaultRam} > 0`),
    check("exposed_port_range", sql`${table.exposedPort} > 1024`),
    unique("name_tag").on(table.name, table.tag),
  ],
);
