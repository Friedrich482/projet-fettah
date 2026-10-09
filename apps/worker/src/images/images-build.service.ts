import { join } from "node:path";

import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { db } from "@repo/db/db";
import { images } from "@repo/db/schema";

import { DockerService } from "../docker/docker.service";
import { IMAGE_DEFINITIONS } from "./constants";
import type { BuildAndUpsertDtoType } from "./images.dto";
import { resolveImagesRoot } from "./utils/resolve-images-root";

@Injectable()
export class ImagesBuildService implements OnModuleInit {
  private readonly logger = new Logger(ImagesBuildService.name, {
    timestamp: true,
  });

  private ready: Promise<void> | undefined;

  constructor(private readonly dockerService: DockerService) {}

  waitUntilReady() {
    if (!this.ready) {
      throw new Error("ImagesBuildService has not started building yet");
    }

    return this.ready;
  }

  private async buildAndUpsert(buildAndUpsertDto: BuildAndUpsertDtoType) {
    const { imagesRoot, name, tag, dir, defaultCpu, defaultRam, exposedPort } =
      buildAndUpsertDto;

    const repository = `${name}:${tag}`;
    this.logger.log(`Preparing image ${repository}...`);

    let digest: string | null;

    try {
      digest = await this.dockerService.buildImage({
        contextPath: join(imagesRoot, dir),
        dockerfile: "Dockerfile",
        name,
        tag,
      });
    } catch (error) {
      this.logger.error(`Failed to build image ${repository}`, error);
      throw error;
    }

    await db
      .insert(images)
      .values({ name, tag, digest, defaultCpu, defaultRam, exposedPort })
      .onConflictDoUpdate({
        target: [images.name, images.tag],
        set: { digest, defaultCpu, defaultRam, exposedPort },
      });
  }

  private async buildAll() {
    const imagesRoot = resolveImagesRoot();

    for (const definition of IMAGE_DEFINITIONS) {
      await this.buildAndUpsert({ ...definition, imagesRoot });
    }

    this.logger.log(`Built and registered ${IMAGE_DEFINITIONS.length} images`);
  }

  onModuleInit() {
    this.ready = this.buildAll();
    return this.ready;
  }
}
