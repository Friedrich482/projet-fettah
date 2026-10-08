// this script is used to run migrations in production without using `drizzle-kit`
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { join } from "node:path";

import { db } from "./drizzle/db";

const runMigrations = async () => {
  await migrate(db, {
    migrationsFolder: join(__dirname, "drizzle", "migrations"),
  });
};

void runMigrations();
