import { oc, populateContractRouterPaths } from "@orpc/contract";

import { HealthOutputSchema } from "./types-schemas";

export const healthContract = oc
  .route({
    method: "GET",
    path: "/health",
    operationId: "getHealth",
    summary: "Health check",
    description: "Returns 200 if the API process is up and responding.",
    successDescription: "The API is up and responding",
  })
  .output(HealthOutputSchema);

export const contract = populateContractRouterPaths({
  health: healthContract,
});
