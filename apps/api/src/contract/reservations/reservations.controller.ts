import { contract } from "@/orpc-contract/contract";
import { Controller } from "@nestjs/common";
import { Implement } from "@orpc/nest";
import { implement } from "@orpc/server";
import { Session, UserSession } from "@thallesp/nestjs-better-auth";

import { ReservationsService } from "./reservations.service";

@Controller()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Implement(contract.reservations.findAll)
  findAll(@Session() session: UserSession) {
    return implement(contract.reservations.findAll).handler(() =>
      this.reservationsService.findAll({ userId: session.user.id }),
    );
  }
}
