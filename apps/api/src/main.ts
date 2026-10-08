import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { ALLOWED_CLIENTS } from "./common/constants";
import { defineOpenApiReference } from "./openapi/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.enableCors({
    origin: ALLOWED_CLIENTS,
    credentials: true,
  });

  const openAPIRef = await defineOpenApiReference();
  app.use("/reference", openAPIRef);

  await app.listen(process.env.PORT ?? 3040);
}
void bootstrap();
