import { EnvService } from "@/env/env.service";
import { ImagesBuildService } from "@/images/images-build.service";
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";

import { WORKER_HEARTBEAT_INTERVAL_MS } from "./constants";
import { WorkersService } from "./workers.service";

@Injectable()
export class WorkersHeartbeat implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkersHeartbeat.name, {
    timestamp: true,
  });

  private timer: NodeJS.Timeout | undefined;

  constructor(
    private readonly envService: EnvService,
    private readonly workersService: WorkersService,
    private readonly imagesBuildService: ImagesBuildService,
  ) {}

  private async beat() {
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

  async onModuleInit() {
    await this.imagesBuildService.waitUntilReady();

    await this.workersService.identify({
      name: this.envService.get("WORKER_NAME"),
    });

    this.timer = setInterval(() => {
      void this.beat();
    }, WORKER_HEARTBEAT_INTERVAL_MS);
  }

  async onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    const workerId = this.workersService.getCurrentWorkerId();
    if (workerId) {
      await this.workersService.setStatus({ id: workerId, status: "offline" });
    }
  }
}
