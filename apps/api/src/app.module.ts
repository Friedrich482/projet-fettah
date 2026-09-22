import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { EnvSchema } from "./env/env";
import { EnvModule } from "./env/env.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => EnvSchema.parse(env),
      expandVariables: true,
    }),
    EnvModule,
    DrizzleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
