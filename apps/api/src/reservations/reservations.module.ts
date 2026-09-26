import { DrizzleModule } from "@/drizzle/drizzle.module";
import { Module } from "@nestjs/common";

import { ReservationsService } from "./reservations.service";

@Module({
  imports: [DrizzleModule],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
