import { eq, SQL } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { workers } from "@/drizzle/schema";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  CreateWorkerDtoType,
  DeleteWorkerDtoType,
  FindOneWorkerDtoType,
  UpdateWorkerDtoType,
} from "./workers.dto";

@Injectable()
export class WorkersService {
  private readonly workersColumns = {
    id: workers.id,
    name: workers.name,
    status: workers.status,
    lastHeartbeatAt: workers.lastHeartbeatAt,
  };

  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase,
  ) {}

  async create(createWorkerDto: CreateWorkerDtoType) {
    const { name, status, lastHeartbeatAt } = createWorkerDto;

    const [existingWorkerWithSameName] = await this.db
      .select({ name: workers.name })
      .from(workers)
      .where(eq(workers.name, name))
      .limit(1);

    if (existingWorkerWithSameName) {
      throw new ConflictException("This worker already exists");
    }

    const [createdWorker] = await this.db
      .insert(workers)
      .values({ name, status, lastHeartbeatAt })
      .onConflictDoNothing()
      .returning(this.workersColumns);

    if (!createdWorker) {
      throw new ConflictException("This worker already exists");
    }

    return createdWorker;
  }

  private async retrieveWorker(sqlEqualClause: SQL | undefined) {
    const [workerFound] = await this.db
      .select(this.workersColumns)
      .from(workers)
      .where(sqlEqualClause)
      .limit(1);

    if (!workerFound) {
      return null;
    }

    return workerFound;
  }

  async findOne(findOneWorkerDto: FindOneWorkerDtoType) {
    const { type } = findOneWorkerDto;

    if (type === "id") {
      const { id } = findOneWorkerDto;
      const worker = await this.retrieveWorker(eq(workers.id, id));

      return worker;
    }

    const { name } = findOneWorkerDto;
    const worker = await this.retrieveWorker(eq(workers.name, name));

    return worker;
  }

  async update(updateWorkerDto: UpdateWorkerDtoType) {
    const { id, ...setFields } = updateWorkerDto;

    if (Object.keys(setFields).length === 0) {
      throw new BadRequestException("You need to specify at least one field");
    }

    const [returningWorker] = await this.db
      .update(workers)
      .set({ ...setFields })
      .where(eq(workers.id, id))
      .returning(this.workersColumns);

    if (!returningWorker) {
      throw new NotFoundException("Worker not found");
    }

    return returningWorker;
  }

  async delete(deleteWorkerDto: DeleteWorkerDtoType) {
    const { id } = deleteWorkerDto;

    const [deletedWorker] = await this.db
      .delete(workers)
      .where(eq(workers.id, id))
      .returning(this.workersColumns);

    if (!deletedWorker) {
      throw new NotFoundException("Worker not found");
    }

    return deletedWorker;
  }
}
