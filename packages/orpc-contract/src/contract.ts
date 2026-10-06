import { populateContractRouterPaths } from "@orpc/contract";

import { contract as HealthContract } from "./health/contract";
import { contrat as ImagesContract } from "./images/contract";
import { contrat as MachinesContract } from "./machines/contract";
import { contrat as ReservationsContract } from "./reservations/contract";

export const contract = populateContractRouterPaths({
  health: HealthContract,
  reservations: ReservationsContract,
  machines: MachinesContract,
  images: ImagesContract,
});
