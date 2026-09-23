import { DrizzleModule } from "@/drizzle/drizzle.module";
import { EnvModule } from "@/env/env.module";
import { Module } from "@nestjs/common";

import { AuthService } from "./auth.service";

@Module({
  imports: [EnvModule, DrizzleModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
