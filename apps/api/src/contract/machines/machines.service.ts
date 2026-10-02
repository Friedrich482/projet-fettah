import { EnvService } from "@/env/env.service";
import { MachinesService as CrudMachinesService } from "@/machines/machines.service";
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { ConnectMachineDtoType, GetMachineDtoType } from "./machines.dto";

@Injectable()
export class MachinesService {
  constructor(
    private readonly crudMachinesService: CrudMachinesService,
    private readonly envService: EnvService,
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
}
