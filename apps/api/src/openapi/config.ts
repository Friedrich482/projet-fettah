import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { contract } from "@repo/orpc-contract/contract";
import { apiReference } from "@scalar/nestjs-api-reference";

export const defineOpenApiReference = async () => {
  const openAPIGenerator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
  });

  const spec = await openAPIGenerator.generate(contract, {
    info: {
      title: "Projet Deploiement API",
      version: "1.0.0",
      description: "API Reference for Projet Deploiement",
    },
    servers: [{ url: process.env.SERVER_URL! }],
    security: [{ apiKeyCookie: [], bearerAuth: [] }],
  });

  const reference = apiReference({
    cdn: "https://cdn.jsdelivr.net/npm/@scalar/api-reference",
    theme: "default",
    content: spec,
    pageTitle: "Projet Deploiement API",
    authentication: {
      preferredSecurityScheme: [["apiKeyCookie", "bearerAuth"]],
      securitySchemes: {
        apiKeyCookie: {
          name: "apiKeyCookie",
          in: "cookie",
          description: "API Key authentication via cookie",
        },
        bearerAuth: {
          description: "Bearer token authentication",
          scheme: "bearer",
        },
      },
    },
  });

  return reference;
};
