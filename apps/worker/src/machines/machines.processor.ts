import { Job } from "bullmq";
import { eq } from "drizzle-orm";

import { DockerService } from "@/docker/docker.service";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import {
  MACHINE_ACTIONS_QUEUE,
  START_JOB,
} from "@repo/common/queues/constants";
import { StartJob } from "@repo/common/queues/types-schemas";
import { db } from "@repo/db/db";
import { machines } from "@repo/db/schema";

import { CompleteStartDtoType, FailMachineDtoType } from "./machines.dto";

@Injectable()
@Processor(MACHINE_ACTIONS_QUEUE, { concurrency: 1 })
export class MachinesProcessor extends WorkerHost {
  private readonly logger = new Logger(MachinesProcessor.name, {
    timestamp: true,
  });

  constructor(private readonly dockerService: DockerService) {
    super();
  }

  private async findMachine(machineId: string) {
    const [machineFound] = await db
      .select({
        id: machines.id,
        status: machines.status,
        containerId: machines.containerId,
        sshPort: machines.sshPort,
      })
      .from(machines)
      .where(eq(machines.id, machineId))
      .limit(1);

    if (!machineFound) {
      return null;
    }

    return machineFound;
  }

  private isLastAttempt(job: Job<StartJob>) {
    return job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
  }

  private async completeStart({ machineId, sshPort }: CompleteStartDtoType) {
    await db
      .update(machines)
      .set({
        status: "running",
        lastError: null,
        workerId: null,
        ...(sshPort ? { sshPort } : {}),
      })
      .where(eq(machines.id, machineId));
  }

  private async failMachine({ machineId, error }: FailMachineDtoType) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    const lastError = rawMessage.replace(/[^\x20-\x7E]/g, " ").trim();

    try {
      await db
        .update(machines)
        .set({ status: "failed", lastError, workerId: null })
        .where(eq(machines.id, machineId));
    } catch (databaseError) {
      this.logger.error("Failed to record the machine failure", databaseError);
    }
  }

  private async start(job: Job<StartJob>) {
    const { machineId, containerId, name } = job.data;

    const machine = await this.findMachine(machineId);

    if (!machine) {
      throw new Error(`Machine ${machineId} not found`);
    }

    if (machine.status === "running") {
      return;
    }

    if (machine.status !== "pending") {
      throw new Error(
        `The machine ${machineId} cannot be started from the ${machine.status} status`,
      );
    }

    if (!machine.containerId) {
      throw new Error(`The machine ${machineId} has no container to start`);
    }

    try {
      const { hostPort } = await this.dockerService.startContainer({
        containerId,
      });

      await this.completeStart({
        machineId,
        sshPort: hostPort ?? machine.sshPort,
      });

      this.logger.log(`Started the machine ${name}`);
    } catch (error) {
      if (this.isLastAttempt(job)) {
        await this.failMachine({ machineId, error });
      }

      throw error;
    }
  }

  async process(job: Job<StartJob>) {
    if (job.name !== START_JOB) {
      return;
    }

    await this.start(job);
  }
}
