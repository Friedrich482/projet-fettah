import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { ulid } from "ulid";

import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import * as schema from "@/drizzle/schema";
import { EnvService } from "@/env/env.service";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  constructor(
    private readonly envService: EnvService,

    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase,
  ) {}

  getBetterAuthInstance() {
    const betterAuthInstance = betterAuth({
      database: drizzleAdapter(this.db, {
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
      baseURL: this.envService.get("BETTER_AUTH_URL"),
      plugins: [openAPI()],
    });

    return betterAuthInstance;
  }
}
