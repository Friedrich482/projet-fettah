import { HealthOutputSchemaType as HealthDtoType } from "@/orpc-contract/health/types-schemas";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }

  health(): HealthDtoType {
    return { ok: true };
  }
}
