import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { REQUEST } from "@nestjs/core";
import { ORPCError, ORPCModule } from "@orpc/nest";
import { experimental_RethrowHandlerPlugin as RethrowHandlerPlugin } from "@orpc/server/plugins";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { AuthService } from "./auth/auth.service";
import { DrizzleModule } from "./drizzle/drizzle.module";
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
    ORPCModule.forRootAsync({
      useFactory: (request: Request) => ({
        context: { request },
        eventIteratorKeepAliveInterval: 5000,
        customJsonSerializers: [],
        plugins: [
          new RethrowHandlerPlugin({
            filter: (error) => {
              // Rethrow all non-ORPCError errors
              // This allows unhandled exceptions to bubble up to NestJS global exception filters
              return !(error instanceof ORPCError);
            },
          }),
        ],
      }),
      inject: [REQUEST],
    }),
    EnvModule,
    DrizzleModule,
    AuthModule,
    ImagesModule,
    WorkersModule,
    ReservationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
