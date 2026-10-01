import { EnvModule } from "@/env/env.module";
import { ImagesModule } from "@/images/images.module";
import { Module } from "@nestjs/common";

import { WorkersHeartbeat } from "./workers.heartbeat";
import { WorkersService } from "./workers.service";

@Module({
  imports: [EnvModule, ImagesModule],
  providers: [WorkersService, WorkersHeartbeat],
  exports: [WorkersService],
})
export class WorkersModule {}
