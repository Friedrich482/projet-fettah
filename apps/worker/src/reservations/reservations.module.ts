import { DockerModule } from "@/docker/docker.module";
import { EnvModule } from "@/env/env.module";
import { QueuesModule } from "@/queues/queues.module";
import { WorkersModule } from "@/workers/workers.module";
import { Module } from "@nestjs/common";

import { ReservationsProcessor } from "./reservations.processor";

@Module({
  imports: [QueuesModule, DockerModule, WorkersModule, EnvModule],
  providers: [ReservationsProcessor],
})
export class ReservationsModule {}
