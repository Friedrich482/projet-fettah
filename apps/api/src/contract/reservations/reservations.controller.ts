import { contract } from "@/orpc-contract/contract";
import { Controller } from "@nestjs/common";
import { Implement } from "@orpc/nest";
import { implement } from "@orpc/server";
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
}
