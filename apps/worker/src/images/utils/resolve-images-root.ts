import { existsSync } from "node:fs";
import { join } from "node:path";

import { IMAGE_DEFINITIONS } from "../constants";

export const resolveImagesRoot = () => {
  const candidate = join(__dirname, "..", "..", "..", "..");

  const isImagesRoot = IMAGE_DEFINITIONS.every((definition) =>
    existsSync(join(candidate, definition.dir, "Dockerfile")),
  );

  if (!isImagesRoot) {
    throw new Error(
      `Unable to locate the worker images directory at ${candidate}`,
    );
  }

  return candidate;
};
