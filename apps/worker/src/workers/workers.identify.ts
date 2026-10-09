import { EnvService } from "@/env/env.service";
import { ImagesBuildService } from "@/images/images-build.service";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { WorkersService } from "./workers.service";

@Injectable()
export class WorkersIdentify implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly envService: EnvService,
    private readonly workersService: WorkersService,
    private readonly imagesBuildService: ImagesBuildService,
  ) {}

  async onModuleInit() {
    await this.imagesBuildService.waitUntilReady();

    await this.workersService.identify({
      name: this.envService.get("WORKER_NAME"),
    });
  }

  async onModuleDestroy() {
    const workerId = this.workersService.getCurrentWorkerId();
    if (workerId) {
      await this.workersService.setStatus({ id: workerId, status: "offline" });
    }
  }
}
