import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DockerModule } from "./docker/docker.module";
import { EnvSchema } from "./env/env";
import { EnvModule } from "./env/env.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => EnvSchema.parse(env),
    }),
    EnvModule,
    DockerModule,
  ],
})
export class AppModule {}
