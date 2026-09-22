import { drizzle as drizzleOrm } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let connectionPool: Pool | null = null;
let drizzleInstance: ReturnType<typeof drizzleOrm> | null = null;

export const createDbConnection = (connectionString: string) => {
  if (!connectionPool) {
    connectionPool = new Pool({
      connectionString,
    });
  }

  if (!drizzleInstance) {
    drizzleInstance = drizzleOrm({ client: connectionPool });
  }

  return { drizzle: drizzleInstance };
};
