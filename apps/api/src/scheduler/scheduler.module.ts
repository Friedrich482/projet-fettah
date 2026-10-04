import { MachinesModule } from "@/machines/machines.module";
import { QueuesModule } from "@/queues/queues.module";
import { ReservationsModule } from "@/reservations/reservations.module";
import { Module } from "@nestjs/common";

import { ExpirationScheduler } from "./expiration.scheduler";

@Module({
  imports: [ReservationsModule, MachinesModule, QueuesModule],
  providers: [ExpirationScheduler],
})
export class SchedulerModule {}
