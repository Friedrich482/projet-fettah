import { Injectable, Logger } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";

import { WORKER_HEARTBEAT_INTERVAL_MS } from "./constants";
import { WorkersService } from "./workers.service";

@Injectable()
export class HeartbeatScheduler {
  private readonly logger = new Logger(HeartbeatScheduler.name, {
    timestamp: true,
  });

  constructor(private readonly workersService: WorkersService) {}

  @Interval(WORKER_HEARTBEAT_INTERVAL_MS)
  async handleHeartbeat() {
    const workerId = this.workersService.getCurrentWorkerId();

    if (!workerId) {
      return;
    }

    try {
      await this.workersService.recordHeartbeat({
        id: workerId,
        lastHeartbeatAt: new Date(),
      });
    } catch (error) {
      this.logger.error("Failed to record the worker heartbeat", error);
    }
  }
}
