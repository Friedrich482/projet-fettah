import { Job } from "bullmq";
import { and, eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";

import { DockerService } from "@/docker/docker.service";
import { EnvService } from "@/env/env.service";
import { WorkersService } from "@/workers/workers.service";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { PROVISION_JOB, PROVISION_QUEUE } from "@repo/common/queues/constants";
import { ProvisionJob } from "@repo/common/queues/types-schemas";
import { db } from "@repo/db/db";
import { images, machines, reservations } from "@repo/db/schema";

import { MILLISECONDS_PER_SECOND, SSH_PASSWORD_BYTES } from "./constants";
import {
  ClaimMachineDtoType,
  CompleteProvisionDtoType,
  FailMachineDtoType,
} from "./reservations.dto";

@Injectable()
@Processor(PROVISION_QUEUE, { concurrency: 1 })
export class ReservationsProcessor extends WorkerHost {
  private readonly logger = new Logger(ReservationsProcessor.name, {
    timestamp: true,
  });

  constructor(
    private readonly dockerService: DockerService,
    private readonly envService: EnvService,
    private readonly workersService: WorkersService,
  ) {
    super();
  }

  private async findMachine(machineId: string) {
    const [machineFound] = await db
      .select({
        id: machines.id,
        status: machines.status,
        containerId: machines.containerId,
      })
      .from(machines)
      .where(eq(machines.id, machineId))
      .limit(1);

    if (!machineFound) {
      return null;
    }

    return machineFound;
  }

  private async findImage(imageId: string) {
    const [imageFound] = await db
      .select({
        id: images.id,
        name: images.name,
        tag: images.tag,
        exposedPort: images.exposedPort,
      })
      .from(images)
      .where(eq(images.id, imageId))
      .limit(1);

    if (!imageFound) {
      return null;
    }

    return imageFound;
  }

  private async claimMachine({ machineId, workerId }: ClaimMachineDtoType) {
    await db
      .update(machines)
      .set({ status: "provisioning", workerId })
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

  private async completeProvision({
    machineId,
    reservationId,
    containerId,
    sshPort,
    sshPassword,
    duration,
  }: CompleteProvisionDtoType) {
    await db.transaction(async (tx) => {
      await tx
        .update(machines)
        .set({
          status: "running",
          containerId,
          workerId: null,
          sshUsername: this.envService.get("SSH_USERNAME"),
          sshPassword,
          sshPort,
          lastError: null,
        })
        .where(eq(machines.id, machineId));

      await tx
        .update(reservations)
        .set({
          status: "active",
          expiresAt: new Date(Date.now() + duration * MILLISECONDS_PER_SECOND),
        })
        .where(
          and(
            eq(reservations.id, reservationId),
            eq(reservations.status, "pending"),
          ),
        );
    });
  }

  private async provision(job: Job<ProvisionJob>) {
    const { machineId, imageId, reservationId, name, cpu, ram, duration } =
      job.data;

    const workerId = this.workersService.getCurrentWorkerId();
    if (!workerId) {
      throw new Error("The worker has not identified itself yet");
    }

    const machine = await this.findMachine(machineId);
    if (!machine) {
      throw new Error(`Machine ${machineId} not found`);
    }

    if (machine.status === "running" && machine.containerId) {
      return;
    }

    const isProvisionable =
      machine.status === "pending" ||
      (machine.status === "failed" && !machine.containerId);

    if (!isProvisionable) {
      this.logger.log(
        `Skipping the provisioning of the machine ${name} because it is ${machine.status}`,
      );

      return;
    }

    const image = await this.findImage(imageId);

    if (!image) {
      throw new Error(`Image ${imageId} not found`);
    }

    await this.claimMachine({ machineId, workerId });

    try {
      const { containerId, hostPort } =
        await this.dockerService.provisionContainer({
          image: { name: image.name, tag: image.tag },
          name,
          cpu,
          ram,
          network: this.envService.get("MACHINES_NETWORK"),
          exposedPort: image.exposedPort,
          hostIp: this.envService.get("MACHINES_SSH_HOST_IP"),
          labels: { machineId },
        });

      const sshPassword = randomBytes(SSH_PASSWORD_BYTES).toString("base64url");

      await this.dockerService.setContainerPassword({
        containerId,
        username: this.envService.get("SSH_USERNAME"),
        password: sshPassword,
      });

      await this.completeProvision({
        machineId,
        reservationId,
        containerId,
        sshPort: hostPort,
        sshPassword,
        duration,
      });
    } catch (error) {
      await this.failMachine({ machineId, error });

      throw error;
    }
  }

  async process(job: Job<ProvisionJob>) {
    if (job.name !== PROVISION_JOB) {
      return;
    }

    await this.provision(job);
  }
}
