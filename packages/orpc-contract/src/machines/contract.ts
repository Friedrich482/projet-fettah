import { oc, populateContractRouterPaths } from "@orpc/contract";

import {
  ConnectMachineInputSchema,
  ConnectMachineOutputSchema,
  GetMachineInputSchema,
  GetMachineOutputSchema,
} from "./types-schemas";

const getMachineContract = oc
  .route({
    method: "GET",
    path: "/machines/{id}",
    operationId: "getMachine",
    summary: "Get a machine",
    description:
      "This endpoint returns one machine of a specific user, without its connection credentials",
    successDescription: "The machine is returned",
  })
  .input(GetMachineInputSchema)
  .output(GetMachineOutputSchema);

const connectMachineContract = oc
  .route({
    method: "POST",
    path: "/machines/{id}/connect",
    operationId: "connectMachine",
    summary: "Get the connection details of a machine",
    description:
      "This endpoint returns the SSH connection details of one running machine of a specific user",
    successDescription: "The connection details are returned",
  })
  .input(ConnectMachineInputSchema)
  .output(ConnectMachineOutputSchema);

export const contrat = populateContractRouterPaths({
  findOne: getMachineContract,
  connect: connectMachineContract,
});
