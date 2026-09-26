import { oc, populateContractRouterPaths } from "@orpc/contract";

import {
  GetUserReservationInputSchema,
  GetUserReservationOutputSchema,
  GetUserReservationsOutputSchema,
} from "./types-schemas";

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

const getUserReservationContract = oc
  .route({
    method: "GET",
    path: "/reservations/{id}",
    operationId: "getUserReservation",
    summary: "Get a user reservation",
    description: "This endpoint returns one reservation of a specific user",
    successDescription: "The reservation is returned",
  })
  .input(GetUserReservationInputSchema)
  .output(GetUserReservationOutputSchema);

export const contrat = populateContractRouterPaths({
  findAll: getUserReservationsContract,
  findOne: getUserReservationContract,
});
