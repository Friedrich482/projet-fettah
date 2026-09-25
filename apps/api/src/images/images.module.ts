import { DrizzleModule } from "@/drizzle/drizzle.module";
import { Module } from "@nestjs/common";

import { ImagesService } from "./images.service";

@Module({
  imports: [DrizzleModule],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
