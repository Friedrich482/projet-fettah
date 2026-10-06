import { ImagesModule as CrudImagesModule } from "@/images/images.module";
import { Module } from "@nestjs/common";

import { ImagesController } from "./images.controller";
import { ImagesService } from "./images.service";

@Module({
  imports: [CrudImagesModule],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
