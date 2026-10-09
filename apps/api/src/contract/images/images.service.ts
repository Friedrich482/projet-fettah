import { ImagesService as CrudImagesService } from "@/images/images.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ImagesService {
  constructor(private readonly crudImagesService: CrudImagesService) {}

  async findAll() {
    const images = await this.crudImagesService.findAll();

    const returningImages = images.map((image) => ({
      id: image.id,
      name: image.name,
      tag: image.tag,
      maxRam: image.defaultRam,
      maxCpu: image.defaultCpu,
    }));

    return returningImages;
  }
}
