import { oc, populateContractRouterPaths } from "@orpc/contract";

import {
  CreateReservationInputSchema,
  CreateReservationOutputSchema,
  DestroyUserReservationInputSchema,
  DestroyUserReservationOutputSchema,
  GetUserReservationInputSchema,
  GetUserReservationOutputSchema,
  GetUserReservationsOutputSchema,
} from "./types-schemas";

const createReservationContract = oc
  .route({
    method: "POST",
    path: "/reservations",
    operationId: "createReservation",
    summary: "Create a reservation",
    description:
      "This endpoint creates a reservation for a specific user along with its machine",
    successDescription: "The reservation and its machine are created",
  })
  .input(CreateReservationInputSchema)
  .output(CreateReservationOutputSchema);

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

const destroyUserReservationContract = oc
  .route({
    method: "DELETE",
    path: "/reservations/{id}",
    operationId: "destroyReservation",
    summary: "Destroy a user reservation",
    description:
      "This endpoint destroys one reservation of a specific user along with the machine it provisioned. The reservation and the machine are kept as cancelled and destroyed once the container is removed",
    successDescription:
      "The reservation is cancelled and its machine is destroying",
  })
  .input(DestroyUserReservationInputSchema)
  .output(DestroyUserReservationOutputSchema);

export const contrat = populateContractRouterPaths({
  create: createReservationContract,
  findAll: getUserReservationsContract,
  findOne: getUserReservationContract,
  destroy: destroyUserReservationContract,
});
