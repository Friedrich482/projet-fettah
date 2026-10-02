import { oc, populateContractRouterPaths } from "@orpc/contract";

import {
  ConnectMachineInputSchema,
  ConnectMachineOutputSchema,
  GetMachineInputSchema,
  GetMachineOutputSchema,
  GetMachinesOutputSchema,
} from "./types-schemas";

const getMachinesContract = oc
  .route({
    method: "GET",
    path: "/machines",
    operationId: "getMachines",
    summary: "Get the user machines",
    description:
      "This endpoint returns all the machines of a specific user, without their connection credentials",
    successDescription: "The machines are returned",
  })
  .output(GetMachinesOutputSchema);

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
  findAll: getMachinesContract,
  findOne: getMachineContract,
  connect: connectMachineContract,
});
