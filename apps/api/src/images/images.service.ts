import { and, eq, SQL } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import { images } from "@/drizzle/schema";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

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

  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase,
  ) {}

  async create(createImageDto: CreateImageDtoType) {
    const { name, tag, digest, exposedPort, defaultCpu, defaultRam } =
      createImageDto;

    const [existingImageWithSameNameAndTag] = await this.db
      .select({ name: images.name, tag: images.tag })
      .from(images)
      .where(and(eq(images.name, name), eq(images.tag, tag)))
      .limit(1);

    if (existingImageWithSameNameAndTag) {
      throw new ConflictException("This image already exists");
    }

    const [createdImage] = await this.db
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
    const [imageFound] = await this.db
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

  async update(updateImageDto: UpdateImageDtoType) {
    const { id, ...setFields } = updateImageDto;

    if (Object.keys(setFields).length === 0) {
      throw new BadRequestException("You need to specify at least one field");
    }

    const [returningHotUpdateEntry] = await this.db
      .update(images)
      .set({ ...setFields })
      .where(eq(images.id, id))
      .returning(this.imagesColumns);

    if (!returningHotUpdateEntry) {
      throw new NotFoundException("Image not found");
    }

    return returningHotUpdateEntry;
  }

  async delete(deleteImageDto: DeleteImageDtoType) {
    const { id } = deleteImageDto;

    const [deletedImage] = await this.db
      .delete(images)
      .where(eq(images.id, id))
      .returning(this.imagesColumns);

    if (!deletedImage) {
      throw new NotFoundException("Hot update entry not found");
    }

    return deletedImage;
  }
}
