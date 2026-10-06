import { EnvModule } from "@/env/env.module";
import { ImagesModule } from "@/images/images.module";
import { Module } from "@nestjs/common";

import { HeartbeatScheduler } from "./heartbeat.scheduler";
import { WorkersIdentify } from "./workers.identify";
import { WorkersService } from "./workers.service";

@Module({
  imports: [EnvModule, ImagesModule],
  providers: [WorkersService, WorkersIdentify, HeartbeatScheduler],
  exports: [WorkersService],
})
export class WorkersModule {}
