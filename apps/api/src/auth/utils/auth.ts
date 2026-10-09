import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, openAPI } from "better-auth/plugins";
import { ulid } from "ulid";

import { db } from "@repo/db/db";
import * as schema from "@repo/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendOnSignUp: true,
  },
  user: {
    changeEmail: { enabled: true },
  },
  advanced: {
    database: {
      generateId: () => ulid().toLowerCase(),
    },
    cookiePrefix: "projet-deploiement",
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    modelName: "rate_limit",
  },
  basePath: "/auth",
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [openAPI(), bearer()],
});
