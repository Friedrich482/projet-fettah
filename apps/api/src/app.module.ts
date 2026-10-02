import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { REQUEST } from "@nestjs/core";
import { ORPCError, ORPCModule } from "@orpc/nest";
import { experimental_RethrowHandlerPlugin as RethrowHandlerPlugin } from "@orpc/server/plugins";
import { AuthModule } from "@thallesp/nestjs-better-auth";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { auth } from "./auth/utils/auth";
import { MachinesModule as ContractMachinesModule } from "./contract/machines/machines.module";
import { ReservationsModule as ContractReservationsModule } from "./contract/reservations/reservations.module";
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
      envFilePath: [".env.redis", ".env"],
      validate: (env) => EnvSchema.parse(env),
      expandVariables: true,
    }),
    AuthModule.forRoot({
      auth,
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
    ImagesModule,
    WorkersModule,
    ReservationsModule,
    MachinesModule,
    ContractReservationsModule,
    ContractMachinesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
