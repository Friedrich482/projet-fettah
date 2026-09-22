import { EnvService } from "@/env/env.service";

import { DRIZZLE_ASYNC_PROVIDER } from "../constants";
import { createDbConnection } from "../utils/create-db-connection";

export const drizzleProvider = {
  provide: DRIZZLE_ASYNC_PROVIDER,
  inject: [EnvService],
  useFactory: (envService: EnvService) => {
    const connectionString = envService.get("DATABASE_URL");

    const { drizzle } = createDbConnection(connectionString);

    return drizzle;
  },
};
