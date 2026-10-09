import { EnvModule } from "@/env/env.module";
import { Module } from "@nestjs/common";

import { DockerService } from "./docker.service";
import { dockerClientProvider } from "./providers/docker-client.provider";

@Module({
  imports: [EnvModule],
  providers: [dockerClientProvider, DockerService],
  exports: [DockerService],
})
export class DockerModule {}
