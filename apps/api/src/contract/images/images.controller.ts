import { Controller } from "@nestjs/common";
import { Implement } from "@orpc/nest";
import { implement } from "@orpc/server";
import { contract } from "@repo/orpc-contract/contract";

import { ImagesService } from "./images.service";

@Controller()
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Implement(contract.images.findAll)
  findAll() {
    return implement(contract.images.findAll).handler(() =>
      this.imagesService.findAll(),
    );
  }
}
