import { drizzle as drizzleOrm } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { relations } from "../schema/relations";

let connectionPool: Pool | null = null;
let drizzleInstance: ReturnType<typeof drizzleOrm> | null = null;

export const createDbConnection = (connectionString: string) => {
  if (!connectionPool) {
    connectionPool = new Pool({
      connectionString,
    });
  }

  if (!drizzleInstance) {
    drizzleInstance = drizzleOrm({ client: connectionPool, relations });
  }

  return { drizzle: drizzleInstance };
};
