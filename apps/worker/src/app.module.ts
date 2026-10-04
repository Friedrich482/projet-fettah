import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

import { DockerModule } from "./docker/docker.module";
import { EnvSchema } from "./env/env";
import { EnvModule } from "./env/env.module";
import { ImagesModule } from "./images/images.module";
import { MachinesModule } from "./machines/machines.module";
import { ReservationsModule } from "./reservations/reservations.module";
import { WorkersModule } from "./workers/workers.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => EnvSchema.parse(env),
    }),
    ScheduleModule.forRoot(),
    EnvModule,
    DockerModule,
    WorkersModule,
    ReservationsModule,
    ImagesModule,
    MachinesModule,
  ],
})
export class AppModule {}
