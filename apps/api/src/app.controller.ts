import { Controller, Get } from "@nestjs/common";
import { Implement, implement } from "@orpc/nest";
import { contract } from "@repo/orpc-contract/contract";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @AllowAnonymous()
  @Implement(contract.health.health)
  list() {
    return implement(contract.health.health).handler(() => {
      return this.appService.health();
    });
  }
}
