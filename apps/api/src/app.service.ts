import { Injectable } from "@nestjs/common";
import { HealthOutputSchemaType as HealthDtoType } from "@repo/orpc-contract/health/types-schemas";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }

  health(): HealthDtoType {
    return { ok: true };
  }
}
