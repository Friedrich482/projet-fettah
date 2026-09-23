import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { AuthService } from "./auth/auth.service";
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
    BetterAuthModule.forRootAsync({
      imports: [AuthModule],
      useFactory: (authService: AuthService) => {
        const instance = authService.getBetterAuthInstance();
        return { auth: instance };
      },
      inject: [AuthService],
    }),
    EnvModule,
    DrizzleModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
