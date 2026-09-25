import { DrizzleModule } from "@/drizzle/drizzle.module";
import { Module } from "@nestjs/common";

import { WorkersService } from "./workers.service";

@Module({
  imports: [DrizzleModule],
  providers: [WorkersService],
})
export class WorkersModule {}
