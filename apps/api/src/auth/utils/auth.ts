// ! this file is a replica of the real better auth instance and is only used to generate the database schema
// ! and has no use beyond that
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { ulid } from "ulid";

import { createDbConnection } from "@/drizzle/utils/create-db-connection";

const { drizzle } = createDbConnection(process.env.DATABASE_URL!);

export const auth = betterAuth({
  database: drizzleAdapter(drizzle, {
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: { enabled: true },

  advanced: {
    database: {
      generateId: () => ulid().toLowerCase(),
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    modelName: "rate_limit",
  },

  basePath: "/auth",
});
