import { Queue } from "bullmq";

import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import {
  MACHINE_ACTIONS_QUEUE,
  PROVISION_JOB,
  PROVISION_QUEUE,
  START_JOB,
  STOP_JOB,
} from "@repo/common/queues/constants";
import {
  ProvisionJob,
  StartJob,
  StopJob,
} from "@repo/common/queues/types-schemas";

@Injectable()
export class QueuesService {
  constructor(
    @InjectQueue(PROVISION_QUEUE)
    private readonly provisionQueue: Queue<ProvisionJob>,

    @InjectQueue(MACHINE_ACTIONS_QUEUE)
    private readonly machineActionsQueue: Queue<StartJob | StopJob>,
  ) {}

  async enqueueProvision(provisionJob: ProvisionJob) {
    const job = await this.provisionQueue.add(PROVISION_JOB, provisionJob, {
      jobId: provisionJob.machineId,
    });

    return job;
  }

  async enqueueStart(startJob: StartJob) {
    const job = await this.machineActionsQueue.add(START_JOB, startJob);

    return job;
  }

  async enqueueStop(stopJob: StopJob) {
    const job = await this.machineActionsQueue.add(STOP_JOB, stopJob);

    return job;
  }
}
