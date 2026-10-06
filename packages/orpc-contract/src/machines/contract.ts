import { oc, populateContractRouterPaths } from "@orpc/contract";

import {
  ConnectMachineInputSchema,
  ConnectMachineOutputSchema,
  GetMachineInputSchema,
  GetMachineOutputSchema,
  GetMachinesOutputSchema,
  StartMachineInputSchema,
  StartMachineOutputSchema,
  StopMachineInputSchema,
  StopMachineOutputSchema,
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

const startMachineContract = oc
  .route({
    method: "POST",
    path: "/machines/{id}/start",
    operationId: "startMachine",
    summary: "Start a machine",
    description:
      "This endpoint asks a worker to start the container of one stopped machine of a specific user. The machine goes back to pending until a worker has started it, so poll the machine endpoint to follow the progress. It conflicts when the machine is already running, when a worker is already working on it, or when it is not startable",
    successDescription: "The machine is starting",
  })
  .input(StartMachineInputSchema)
  .output(StartMachineOutputSchema);

const stopMachineContract = oc
  .route({
    method: "POST",
    path: "/machines/{id}/stop",
    operationId: "stopMachine",
    summary: "Stop a machine",
    description:
      "This endpoint asks a worker to stop the container of one running machine of a specific user. The machine goes back to pending until a worker has stopped it, so poll the machine endpoint to follow the progress. It conflicts when the machine is already stopped, when a worker is already working on it, or when it is not stoppable",
    successDescription: "The machine is stopping",
  })
  .input(StopMachineInputSchema)
  .output(StopMachineOutputSchema);

export const contrat = populateContractRouterPaths({
  findAll: getMachinesContract,
  findOne: getMachineContract,
  connect: connectMachineContract,
  start: startMachineContract,
  stop: stopMachineContract,
});
