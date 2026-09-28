import { ImagesModule as CrudImagesModule } from "@/images/images.module";
import { MachinesModule as CrudMachinesModule } from "@/machines/machines.module";
import { QueuesModule } from "@/queues/queues.module";
import { ReservationsModule as CrudReservationsModule } from "@/reservations/reservations.module";
import { Module } from "@nestjs/common";

import { ReservationsController } from "./reservations.controller";
import { ReservationsService } from "./reservations.service";

@Module({
  imports: [
    CrudReservationsModule,
    CrudMachinesModule,
    CrudImagesModule,
    QueuesModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
