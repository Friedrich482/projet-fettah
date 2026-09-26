import { populateContractRouterPaths } from "@orpc/nest";

import { contract as HealthContract } from "./health/contract";
import { contrat as ReservationsContract } from "./reservations/contract";

export const contract = populateContractRouterPaths({
  health: HealthContract,
  reservations: ReservationsContract,
});
