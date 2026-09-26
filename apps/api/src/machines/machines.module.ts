import { DrizzleModule } from "@/drizzle/drizzle.module";
import { Module } from "@nestjs/common";

import { MachinesService } from "./machines.service";

@Module({
  imports: [DrizzleModule],
  providers: [MachinesService],
  exports: [MachinesService],
})
export class MachinesModule {}
