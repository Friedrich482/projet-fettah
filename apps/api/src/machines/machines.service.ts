import { eq, SQL } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { machines } from "@/drizzle/schema";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  CreateMachineDtoType,
  DeleteMachineDtoType,
  FindOneMachineDtoType,
  UpdateMachineDtoType,
} from "./machines.dto";

@Injectable()
export class MachinesService {
  private readonly machinesColumns = {
    id: machines.id,
    reservationId: machines.reservationId,
    imageId: machines.imageId,
    workerId: machines.workerId,
    name: machines.name,
    cpu: machines.cpu,
    ram: machines.ram,
    status: machines.status,
    containerId: machines.containerId,
    lastError: machines.lastError,
    destroyedAt: machines.destroyedAt,
  };

  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase,
  ) {}

  async create(
    createMachineDto: CreateMachineDtoType,
    executor: NodePgDatabase = this.db,
  ) {
    const {
      reservationId,
      imageId,
      workerId,
      name,
      cpu,
      ram,
      status,
      containerId,
      lastError,
      destroyedAt,
    } = createMachineDto;

    const [existingMachineWithSameName] = await executor
      .select({ name: machines.name })
      .from(machines)
      .where(eq(machines.name, name))
      .limit(1);

    if (existingMachineWithSameName) {
      throw new ConflictException("This machine already exists");
    }

    if (containerId) {
      const [existingMachineWithSameContainerId] = await executor
        .select({ containerId: machines.containerId })
        .from(machines)
        .where(eq(machines.containerId, containerId))
        .limit(1);

      if (existingMachineWithSameContainerId) {
        throw new ConflictException("This container id is already used");
      }
    }

    const [createdMachine] = await executor
      .insert(machines)
      .values({
        reservationId,
        imageId,
        workerId,
        name,
        cpu,
        ram,
        status,
        containerId,
        lastError,
        destroyedAt,
      })
      .onConflictDoNothing()
      .returning(this.machinesColumns);

    if (!createdMachine) {
      throw new ConflictException("This machine already exists");
    }

    return createdMachine;
  }

  private async retrieveMachine(sqlEqualClause: SQL) {
    const [machineFound] = await this.db
      .select(this.machinesColumns)
      .from(machines)
      .where(sqlEqualClause)
      .limit(1);

    if (!machineFound) {
      return null;
    }

    return machineFound;
  }

  async findOne(findOneMachineDto: FindOneMachineDtoType) {
    const { type } = findOneMachineDto;

    if (type === "id") {
      const { id } = findOneMachineDto;
      const machine = await this.retrieveMachine(eq(machines.id, id));

      return machine;
    }

    if (type === "name") {
      const { name } = findOneMachineDto;
      const machine = await this.retrieveMachine(eq(machines.name, name));

      return machine;
    }

    const { containerId } = findOneMachineDto;
    const machine = await this.retrieveMachine(
      eq(machines.containerId, containerId),
    );

    return machine;
  }

  async update(updateMachineDto: UpdateMachineDtoType) {
    const { id, ...setFields } = updateMachineDto;

    if (Object.keys(setFields).length === 0) {
      throw new BadRequestException("You need to specify at least one field");
    }

    const [returningMachine] = await this.db
      .update(machines)
      .set({ ...setFields })
      .where(eq(machines.id, id))
      .returning(this.machinesColumns);

    if (!returningMachine) {
      throw new NotFoundException("Machine not found");
    }

    return returningMachine;
  }

  async delete(deleteMachineDto: DeleteMachineDtoType) {
    const { id } = deleteMachineDto;

    const [deletedMachine] = await this.db
      .delete(machines)
      .where(eq(machines.id, id))
      .returning(this.machinesColumns);

    if (!deletedMachine) {
      throw new NotFoundException("Machine not found");
    }

    return deletedMachine;
  }
}
