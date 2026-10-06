import { Controller } from "@nestjs/common";
import { Implement } from "@orpc/nest";
import { implement } from "@orpc/server";
import { contract } from "@repo/orpc-contract/contract";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";

import { ReservationsService } from "./reservations.service";

@Controller()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Implement(contract.reservations.create)
  create(@Session() session: UserSession) {
    return implement(contract.reservations.create).handler(({ input }) =>
      this.reservationsService.create({
        ...input,
        userId: session.user.id,
      }),
    );
  }

  @Implement(contract.reservations.findOne)
  findOne(@Session() session: UserSession) {
    return implement(contract.reservations.findOne).handler(({ input }) =>
      this.reservationsService.findOne({
        ...input,
        userId: session.user.id,
      }),
    );
  }

  @Implement(contract.reservations.findAll)
  findAll(@Session() session: UserSession) {
    return implement(contract.reservations.findAll).handler(() =>
      this.reservationsService.findAll({ userId: session.user.id }),
    );
  }

  @Implement(contract.reservations.destroy)
  destroy(@Session() session: UserSession) {
    return implement(contract.reservations.destroy).handler(({ input }) =>
      this.reservationsService.destroy({
        ...input,
        userId: session.user.id,
      }),
    );
  }
}
