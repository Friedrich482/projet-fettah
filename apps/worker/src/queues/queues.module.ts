import { EnvModule } from "@/env/env.module";
import { EnvService } from "@/env/env.service";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import {
  MACHINE_ACTIONS_QUEUE,
  PROVISION_QUEUE,
} from "@repo/common/queues/constants";

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
    BullModule.registerQueue({ name: PROVISION_QUEUE }),
    BullModule.registerQueue({ name: MACHINE_ACTIONS_QUEUE }),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
