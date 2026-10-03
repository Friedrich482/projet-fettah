import { Controller } from "@nestjs/common";
import { Implement } from "@orpc/nest";
import { implement } from "@orpc/server";
import { contract } from "@repo/orpc-contract/contract";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";

import { MachinesService } from "./machines.service";

@Controller()
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Implement(contract.machines.findAll)
  findAll(@Session() session: UserSession) {
    return implement(contract.machines.findAll).handler(() =>
      this.machinesService.findAll({ userId: session.user.id }),
    );
  }

  @Implement(contract.machines.findOne)
  findOne(@Session() session: UserSession) {
    return implement(contract.machines.findOne).handler(({ input }) =>
      this.machinesService.findOne({
        ...input,
        userId: session.user.id,
      }),
    );
  }

  @Implement(contract.machines.connect)
  connect(@Session() session: UserSession) {
    return implement(contract.machines.connect).handler(({ input }) =>
      this.machinesService.connect({
        ...input,
        userId: session.user.id,
      }),
    );
  }

  @Implement(contract.machines.start)
  start(@Session() session: UserSession) {
    return implement(contract.machines.start).handler(({ input }) =>
      this.machinesService.start({
        ...input,
        userId: session.user.id,
      }),
    );
  }

  @Implement(contract.machines.stop)
  stop(@Session() session: UserSession) {
    return implement(contract.machines.stop).handler(({ input }) =>
      this.machinesService.stop({
        ...input,
        userId: session.user.id,
      }),
    );
  }
}
