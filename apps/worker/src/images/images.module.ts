import { Module } from "@nestjs/common";

import { DockerModule } from "../docker/docker.module";
import { ImagesBuildService } from "./images-build.service";

@Module({
  imports: [DockerModule],
  providers: [ImagesBuildService],
  exports: [ImagesBuildService],
})
export class ImagesModule {}
