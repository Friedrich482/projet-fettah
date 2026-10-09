import { DockerModule } from "@/docker/docker.module";
import { QueuesModule } from "@/queues/queues.module";
import { Module } from "@nestjs/common";

import { MachinesProcessor } from "./machines.processor";

@Module({
  imports: [QueuesModule, DockerModule],
  providers: [MachinesProcessor],
})
export class MachinesModule {}
