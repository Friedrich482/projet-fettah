import { oc, populateContractRouterPaths } from "@orpc/contract";

import { GetUserReservationsOutputSchema } from "./types-schemas";

const getUserReservationsContract = oc
  .route({
    method: "GET",
    path: "/reservations",
    operationId: "getUserReservations",
    summary: "Get the user reservations",
    description: "This endpoint returns the reservations for a specific user",
    successDescription: "The reservations are returned",
  })
  .output(GetUserReservationsOutputSchema);

export const contrat = populateContractRouterPaths({
  findAll: getUserReservationsContract,
});
