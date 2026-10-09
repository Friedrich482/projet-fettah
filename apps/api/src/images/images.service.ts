import { and, eq, SQL } from "drizzle-orm";

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { db } from "@repo/db/db";
import { images } from "@repo/db/schema";

import {
  CreateImageDtoType,
  DeleteImageDtoType,
  FindOneImageDtoType,
  UpdateImageDtoType,
} from "./images.dto";

@Injectable()
export class ImagesService {
  private readonly imagesColumns = {
    id: images.id,
    name: images.name,
    tag: images.tag,
    digest: images.digest,
    exposedPort: images.exposedPort,
    defaultRam: images.defaultRam,
    defaultCpu: images.defaultCpu,
  };

  async create(createImageDto: CreateImageDtoType) {
    const { name, tag, digest, exposedPort, defaultCpu, defaultRam } =
      createImageDto;

    const [existingImageWithSameNameAndTag] = await db
      .select({ name: images.name, tag: images.tag })
      .from(images)
      .where(and(eq(images.name, name), eq(images.tag, tag)))
      .limit(1);

    if (existingImageWithSameNameAndTag) {
      throw new ConflictException("This image already exists");
    }

    const [createdImage] = await db
      .insert(images)
      .values({ name, tag, digest, exposedPort, defaultRam, defaultCpu })
      .onConflictDoNothing()
      .returning(this.imagesColumns);

    if (!createdImage) {
      throw new ConflictException("This image already exists");
    }

    return createdImage;
  }

  private async retrieveImage(sqlEqualClause: SQL | undefined) {
    const [imageFound] = await db
      .select(this.imagesColumns)
      .from(images)
      .where(sqlEqualClause)
      .limit(1);

    if (!imageFound) {
      return null;
    }

    return imageFound;
  }

  async findOne(findOneImageDto: FindOneImageDtoType) {
    const { type } = findOneImageDto;

    if (type === "id") {
      const { id } = findOneImageDto;
      const image = await this.retrieveImage(eq(images.id, id));

      return image;
    }

    if (type === "name-tag") {
      const { name, tag } = findOneImageDto;

      const image = await this.retrieveImage(
        and(eq(images.name, name), eq(images.tag, tag)),
      );
      return image;
    }

    const { digest } = findOneImageDto;

    const image = await this.retrieveImage(eq(images.digest, digest));

    return image;
  }

  async findAll() {
    const returningImages = db
      .select(this.imagesColumns)
      .from(images)
      .orderBy(images.name, images.tag);

    return returningImages;
  }

  async update(updateImageDto: UpdateImageDtoType) {
    const { id, ...setFields } = updateImageDto;

    if (Object.keys(setFields).length === 0) {
      throw new BadRequestException("You need to specify at least one field");
    }

    const [returningImage] = await db
      .update(images)
      .set({ ...setFields })
      .where(eq(images.id, id))
      .returning(this.imagesColumns);

    if (!returningImage) {
      throw new NotFoundException("Image not found");
    }

    return returningImage;
  }

  async delete(deleteImageDto: DeleteImageDtoType) {
    const { id } = deleteImageDto;

    const [deletedImage] = await db
      .delete(images)
      .where(eq(images.id, id))
      .returning(this.imagesColumns);

    if (!deletedImage) {
      throw new NotFoundException("Image not found");
    }

    return deletedImage;
  }
}
