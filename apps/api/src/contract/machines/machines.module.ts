import { EnvModule } from "@/env/env.module";
import { MachinesModule as CrudMachinesModule } from "@/machines/machines.module";
import { Module } from "@nestjs/common";

import { MachinesController } from "./machines.controller";
import { MachinesService } from "./machines.service";

@Module({
  imports: [CrudMachinesModule, EnvModule],
  controllers: [MachinesController],
  providers: [MachinesService],
})
export class MachinesModule {}
