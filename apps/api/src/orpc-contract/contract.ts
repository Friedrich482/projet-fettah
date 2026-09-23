import { populateContractRouterPaths } from "@orpc/nest";

import { contract as HealthContract } from "./health/contract";

export const contract = populateContractRouterPaths({
  health: HealthContract,
});
