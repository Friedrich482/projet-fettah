import { EnvModule } from "@/env/env.module";
import { EnvService } from "@/env/env.service";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import {
  MACHINE_ACTIONS_QUEUE,
  PROVISION_QUEUE,
} from "@repo/common/queues/constants";

import { QueuesService } from "./queues.service";

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        connection: {
          host: envService.get("REDIS_HOST"),
          port: envService.get("REDIS_PORT"),
          password: envService.get("REDIS_HOST_PASSWORD"),
        },
      }),
    }),
    BullModule.registerQueue({
      name: PROVISION_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    }),
    BullModule.registerQueue({
      name: MACHINE_ACTIONS_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    }),
  ],
  providers: [QueuesService],
  exports: [QueuesService],
})
export class QueuesModule {}
