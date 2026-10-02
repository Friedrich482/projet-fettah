import { oc, populateContractRouterPaths } from "@orpc/contract";

import { GetImagesOutputSchema } from "./types-schemas";

const getImagesContract = oc
  .route({
    method: "GET",
    path: "/images",
    operationId: "getImages",
    summary: "Get the available images",
    description:
      "This endpoint returns every image available to create a machine, along with the resources it allows",
    successDescription: "The images are returned",
  })
  .output(GetImagesOutputSchema);

export const contrat = populateContractRouterPaths({
  findAll: getImagesContract,
});
