import { Module } from "@nestjs/common";

import { MachinesService } from "./machines.service";

@Module({
  providers: [MachinesService],
  exports: [MachinesService],
})
export class MachinesModule {}
