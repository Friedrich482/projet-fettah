import z from "zod";

export const ImageSchema = z.object({
  id: z.ulid(),
  name: z
    .string()
    .max(255)
    .regex(
      /^(?:(?:(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])(?:\.(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]))*|\[(?:[a-fA-F0-9:]+)\])(?::[0-9]+)?\/)?[a-z0-9]+(?:(?:[._]|__|[-]+)[a-z0-9]+)*(?:\/[a-z0-9]+(?:(?:[._]|__|[-]+)[a-z0-9]+)*)*$/,
      { error: "The image name must be a valid Docker image name" },
    ),
  tag: z.string().regex(/^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/, {
    error: "The image tag must be a valid Docker tag",
  }),
  digest: z.hash("sha256"),
  exposedPort: z.int().min(1).max(65535),
  defaultCpu: z.int().positive(),
  defaultRam: z.int().positive(),
});

export const GetImagesOutputSchema = z.array(
  z.object({
    ...ImageSchema.pick({ id: true, name: true, tag: true }).shape,

    maxRam: ImageSchema.pick({ defaultRam: true }).shape.defaultRam,
    maxCpu: ImageSchema.pick({ defaultCpu: true }).shape.defaultCpu,
  }),
);
