import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DockerModule } from "./docker/docker.module";
import { EnvSchema } from "./env/env";
import { EnvModule } from "./env/env.module";
import { ImagesModule } from "./images/images.module";
import { ReservationsModule } from "./reservations/reservations.module";
import { WorkersModule } from "./workers/workers.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => EnvSchema.parse(env),
    }),
    EnvModule,
    DockerModule,
    WorkersModule,
    ReservationsModule,
    ImagesModule,
  ],
})
export class AppModule {}
