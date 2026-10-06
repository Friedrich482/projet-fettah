import { EnvService } from "@/env/env.service";
import { MachinesService as CrudMachinesService } from "@/machines/machines.service";
import { QueuesService } from "@/queues/queues.service";
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  ConnectMachineDtoType,
  FindAllMachinesDtoType,
  GetMachineDtoType,
  StartMachineDtoType,
  StopMachineDtoType,
} from "./machines.dto";

@Injectable()
export class MachinesService {
  constructor(
    private readonly crudMachinesService: CrudMachinesService,
    private readonly envService: EnvService,
    private readonly queuesService: QueuesService,
  ) {}

  async findOne(getMachineDto: GetMachineDtoType) {
    const { id, userId } = getMachineDto;

    const machine = await this.crudMachinesService.findOneOwnedBy({
      machineId: id,
      userId,
    });

    if (!machine) {
      throw new NotFoundException("Machine not found");
    }

    const {
      workerId,
      containerId,
      lastError,
      sshUsername,
      sshPassword,
      sshPort,
      ...restMachine
    } = machine;

    return restMachine;
  }

  async connect(connectMachineDto: ConnectMachineDtoType) {
    const { id, userId } = connectMachineDto;

    const machine = await this.crudMachinesService.findOneOwnedBy({
      machineId: id,
      userId,
    });

    if (!machine) {
      throw new NotFoundException("Machine not found");
    }

    if (machine.status !== "running") {
      throw new ConflictException(
        `The machine must be running to be connected, but it is ${machine.status}`,
      );
    }

    const { sshPassword, sshPort } = machine;

    if (!sshPassword || !sshPort) {
      throw new ConflictException(
        "The machine has no SSH credentials yet, please retry later",
      );
    }

    return {
      machineId: machine.id,
      status: machine.status,
      host: this.envService.get("MACHINES_SSH_HOST_IP"),
      port: sshPort,
      username: machine.sshUsername,
      password: sshPassword,
    };
  }

  async findAll(findAllMachinesDto: FindAllMachinesDtoType) {
    const { userId } = findAllMachinesDto;

    const userMachines = await this.crudMachinesService.findAllOwnedBy({
      userId,
    });

    const returningMachines = userMachines.map(
      ({
        workerId,
        containerId,
        lastError,
        sshUsername,
        sshPassword,
        sshPort,
        ...rest
      }) => rest,
    );

    return returningMachines;
  }

  async start(startMachineDto: StartMachineDtoType) {
    const { id, userId } = startMachineDto;

    const machine = await this.crudMachinesService.findOneOwnedBy({
      machineId: id,
      userId,
    });

    if (!machine) {
      throw new NotFoundException("Machine not found");
    }

    const { containerId } = machine;

    if (!containerId) {
      throw new ConflictException(
        "The machine has no container to start, so it was never provisioned",
      );
    }

    if (machine.status === "running") {
      throw new ConflictException("The machine is already running");
    }

    if (machine.status === "pending" || machine.status === "provisioning") {
      throw new ConflictException(
        `A worker is already working on this machine, it is ${machine.status}`,
      );
    }

    if (machine.status === "paused") {
      throw new ConflictException(
        "The machine is paused, unpause it before starting it",
      );
    }

    if (machine.status === "destroying" || machine.status === "destroyed") {
      throw new ConflictException(
        `The machine cannot be started because it is ${machine.status}`,
      );
    }

    const startingMachine = await this.crudMachinesService.transitionStatus({
      id,
      from: ["stopped", "failed"],
      to: "pending",
    });

    if (!startingMachine) {
      const currentMachine = await this.crudMachinesService.findOneOwnedBy({
        machineId: id,
        userId,
      });

      throw new ConflictException(
        `The machine cannot be started because it is ${currentMachine?.status ?? "unavailable"}`,
      );
    }

    try {
      await this.queuesService.enqueueStart({
        machineId: startingMachine.id,
        name: startingMachine.name,
        containerId,
      });
    } catch (error) {
      await this.crudMachinesService.transitionStatus({
        id,
        from: ["pending"],
        to: machine.status,
      });

      throw error;
    }

    const {
      workerId,
      containerId: startingContainerId,
      lastError,
      sshUsername,
      sshPassword,
      sshPort,
      ...restMachine
    } = startingMachine;

    return restMachine;
  }

  async stop(stopMachineDto: StopMachineDtoType) {
    const { id, userId } = stopMachineDto;

    const machine = await this.crudMachinesService.findOneOwnedBy({
      machineId: id,
      userId,
    });

    if (!machine) {
      throw new NotFoundException("Machine not found");
    }

    const { containerId } = machine;

    if (!containerId) {
      throw new ConflictException(
        "The machine has no container to stop, so it was never provisioned",
      );
    }

    if (machine.status === "stopped") {
      throw new ConflictException("The machine is already stopped");
    }

    if (machine.status === "pending" || machine.status === "provisioning") {
      throw new ConflictException(
        `A worker is already working on this machine, it is ${machine.status}`,
      );
    }

    if (machine.status === "paused") {
      throw new ConflictException(
        "The machine is paused, resume it before stopping it",
      );
    }

    if (machine.status === "failed") {
      throw new ConflictException(
        "The machine failed, start it again or destroy it instead of stopping it",
      );
    }

    if (machine.status === "destroying" || machine.status === "destroyed") {
      throw new ConflictException(
        `The machine cannot be stopped because it is ${machine.status}`,
      );
    }

    const stoppingMachine = await this.crudMachinesService.transitionStatus({
      id,
      from: ["running"],
      to: "pending",
    });

    if (!stoppingMachine) {
      const currentMachine = await this.crudMachinesService.findOneOwnedBy({
        machineId: id,
        userId,
      });

      throw new ConflictException(
        `The machine cannot be stopped because it is ${currentMachine?.status ?? "unavailable"}`,
      );
    }

    try {
      await this.queuesService.enqueueStop({
        machineId: stoppingMachine.id,
        name: stoppingMachine.name,
        containerId,
      });
    } catch (error) {
      await this.crudMachinesService.transitionStatus({
        id,
        from: ["pending"],
        to: machine.status,
      });

      throw error;
    }

    const {
      workerId,
      containerId: stoppingContainerId,
      lastError,
      sshUsername,
      sshPassword,
      sshPort,
      ...restMachine
    } = stoppingMachine;

    return restMachine;
  }
}
