import { Job } from "bullmq";
import { and, eq, isNull } from "drizzle-orm";

import { DockerService } from "@/docker/docker.service";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import {
  DESTROY_JOB,
  MACHINE_ACTIONS_QUEUE,
  START_JOB,
  STOP_JOB,
} from "@repo/common/queues/constants";
import {
  DestroyJob,
  StartJob,
  StopJob,
} from "@repo/common/queues/types-schemas";
import { db } from "@repo/db/db";
import { machines, reservations } from "@repo/db/schema";

import {
  CompleteDestroyDtoType,
  CompleteStartDtoType,
  CompleteStopDtoType,
  FailDestroyDtoType,
  FailMachineDtoType,
} from "./machines.dto";

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
        reservationId: machines.reservationId,
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

  private isLastAttempt(job: Job<StartJob | StopJob | DestroyJob>) {
    return job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
  }

  private sanitizeError(error: unknown) {
    const rawMessage = error instanceof Error ? error.message : String(error);

    return rawMessage.replace(/[^\x20-\x7E]/g, " ").trim();
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
      .where(and(eq(machines.id, machineId), eq(machines.status, "pending")));
  }

  private async completeStop({ machineId }: CompleteStopDtoType) {
    await db
      .update(machines)
      .set({
        status: "stopped",
        lastError: null,
        workerId: null,
        sshPort: null,
      })
      .where(and(eq(machines.id, machineId), eq(machines.status, "pending")));
  }

  private async completeDestroy({
    machineId,
    reservationId,
  }: CompleteDestroyDtoType) {
    const destroyedAt = new Date();

    await db.transaction(async (tx) => {
      await tx
        .update(machines)
        .set({
          status: "destroyed",
          destroyedAt,
          containerId: null,
          sshPort: null,
          sshPassword: null,
          workerId: null,
          lastError: null,
        })
        .where(eq(machines.id, machineId));

      await tx
        .update(reservations)
        .set({ endedAt: destroyedAt })
        .where(
          and(eq(reservations.id, reservationId), isNull(reservations.endedAt)),
        );
    });
  }

  private async failMachine({ machineId, error }: FailMachineDtoType) {
    const lastError = this.sanitizeError(error);

    try {
      await db
        .update(machines)
        .set({ status: "failed", lastError, workerId: null })
        .where(eq(machines.id, machineId));
    } catch (databaseError) {
      this.logger.error("Failed to record the machine failure", databaseError);
    }
  }

  private async failDestroy({
    machineId,
    reservationId,
    reservationStatus,
    error,
  }: FailDestroyDtoType) {
    const lastError = this.sanitizeError(error);

    try {
      await db.transaction(async (tx) => {
        await tx
          .update(machines)
          .set({ status: "failed", lastError, workerId: null })
          .where(eq(machines.id, machineId));

        await tx
          .update(reservations)
          .set({ status: reservationStatus })
          .where(
            and(
              eq(reservations.id, reservationId),
              eq(reservations.status, "cancelled"),
            ),
          );
      });
    } catch (databaseError) {
      this.logger.error("Failed to record the destroy failure", databaseError);
    }
  }

  private async start(job: Job<StartJob | StopJob | DestroyJob>) {
    const { machineId, containerId, name } = job.data;

    const machine = await this.findMachine(machineId);

    if (!machine) {
      throw new Error(`Machine ${machineId} not found`);
    }

    if (machine.status === "running") {
      return;
    }

    if (machine.status === "destroying" || machine.status === "destroyed") {
      return;
    }

    if (machine.status !== "pending") {
      throw new Error(
        `The machine ${machineId} cannot be started from the ${machine.status} status`,
      );
    }

    if (!containerId) {
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

  private async stop(job: Job<StartJob | StopJob | DestroyJob>) {
    const { machineId, containerId, name } = job.data;

    const machine = await this.findMachine(machineId);

    if (!machine) {
      throw new Error(`Machine ${machineId} not found`);
    }

    if (machine.status === "stopped") {
      return;
    }

    if (machine.status === "destroying" || machine.status === "destroyed") {
      return;
    }

    if (machine.status !== "pending") {
      throw new Error(
        `The machine ${machineId} cannot be stopped from the ${machine.status} status`,
      );
    }

    if (!containerId) {
      throw new Error(`The machine ${machineId} has no container to stop`);
    }

    try {
      await this.dockerService.stopContainer({ containerId });

      await this.completeStop({ machineId });

      this.logger.log(`Stopped the machine ${name}`);
    } catch (error) {
      if (this.isLastAttempt(job)) {
        await this.failMachine({ machineId, error });
      }

      throw error;
    }
  }

  private async destroy(job: Job<StartJob | StopJob | DestroyJob>) {
    const { machineId, containerId, name } = job.data;

    const reservationStatus =
      "reservationStatus" in job.data ? job.data.reservationStatus : "active";

    const machine = await this.findMachine(machineId);

    if (!machine) {
      return;
    }

    if (machine.status === "destroyed") {
      return;
    }

    if (machine.status !== "destroying") {
      this.logger.log(
        `Skipping the destroy of the machine ${name} because it is ${machine.status}`,
      );

      return;
    }

    try {
      await this.dockerService.destroyContainer({ containerId, name });

      await this.completeDestroy({
        machineId,
        reservationId: machine.reservationId,
      });

      this.logger.log(`Destroyed the machine ${name}`);
    } catch (error) {
      if (this.isLastAttempt(job)) {
        await this.failDestroy({
          machineId,
          reservationId: machine.reservationId,
          reservationStatus,
          error,
        });
      }

      throw error;
    }
  }

  async process(job: Job<StartJob | StopJob | DestroyJob>) {
    if (job.name === START_JOB) {
      await this.start(job);
      return;
    }

    if (job.name === STOP_JOB) {
      await this.stop(job);
      return;
    }

    if (job.name === DESTROY_JOB) {
      await this.destroy(job);
    }

    return;
  }
}
