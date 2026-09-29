import { Queue } from "bullmq";

import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { PROVISION_JOB, PROVISION_QUEUE } from "@repo/common/queues/constants";
import { ProvisionJob } from "@repo/common/queues/types-schemas";

@Injectable()
export class QueuesService {
  constructor(
    @InjectQueue(PROVISION_QUEUE)
    private readonly provisionQueue: Queue<ProvisionJob>,
  ) {}

  async enqueueProvision(provisionJob: ProvisionJob) {
    return this.provisionQueue.add(PROVISION_JOB, provisionJob, {
      jobId: provisionJob.machineId,
    });
  }
}
