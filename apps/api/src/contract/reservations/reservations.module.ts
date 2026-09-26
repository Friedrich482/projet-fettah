import { ReservationsModule as CrudReservationsModule } from "@/reservations/reservations.module";
import { Module } from "@nestjs/common";

import { ReservationsController } from "./reservations.controller";
import { ReservationsService } from "./reservations.service";

@Module({
  imports: [CrudReservationsModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
