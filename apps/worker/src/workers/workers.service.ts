import { eq } from "drizzle-orm";

import { Injectable, NotFoundException } from "@nestjs/common";
import { db } from "@repo/db/db";
import { workers } from "@repo/db/schema";

import {
  IdentifyWorkerDtoType,
  RecordHeartbeatDtoType,
  SetWorkerStatusDtoType,
} from "./workers.dto";

@Injectable()
export class WorkersService {
  private readonly workersColumns = {
    id: workers.id,
    name: workers.name,
    status: workers.status,
    lastHeartbeatAt: workers.lastHeartbeatAt,
  };

  private currentWorkerId: string | undefined;

  getCurrentWorkerId() {
    return this.currentWorkerId;
  }

  async setStatus(setWorkerStatusDto: SetWorkerStatusDtoType) {
    const { id, status } = setWorkerStatusDto;

    const [updatedWorker] = await db
      .update(workers)
      .set({ status })
      .where(eq(workers.id, id))
      .returning(this.workersColumns);

    return updatedWorker ?? null;
  }

  async identify(identifyWorkerDto: IdentifyWorkerDtoType) {
    const { name } = identifyWorkerDto;

    const [existingWorker] = await db
      .select(this.workersColumns)
      .from(workers)
      .where(eq(workers.name, name))
      .limit(1);

    if (existingWorker) {
      this.currentWorkerId = existingWorker.id;

      const worker = this.setStatus({
        id: existingWorker.id,
        status: "online",
      });

      return worker;
    }

    const [createdWorker] = await db
      .insert(workers)
      .values({ name, status: "online", lastHeartbeatAt: new Date() })
      .onConflictDoNothing({ target: workers.name })
      .returning(this.workersColumns);

    if (!createdWorker) {
      throw new Error(`Failed to identify the worker ${name}`);
    }

    this.currentWorkerId = createdWorker.id;

    const worker = this.setStatus({ id: createdWorker.id, status: "online" });

    return worker;
  }

  async recordHeartbeat(recordHeartbeatDto: RecordHeartbeatDtoType) {
    const { id, lastHeartbeatAt } = recordHeartbeatDto;

    const [updatedWorker] = await db
      .update(workers)
      .set({ lastHeartbeatAt })
      .where(eq(workers.id, id))
      .returning(this.workersColumns);

    if (!updatedWorker) {
      throw new NotFoundException("Worker not found");
    }

    return updatedWorker;
  }
}
