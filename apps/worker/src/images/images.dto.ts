import z from "zod";

export const ImageDefinitionDto = z.object({
  name: z.string().trim().min(1),
  tag: z.string().trim().min(1),
  dir: z.string().trim().min(1),
  defaultCpu: z.int().positive(),
  defaultRam: z.int().positive(),
  exposedPort: z.int().min(1).max(65535),
});

export const BuildAndUpsertDto = z.object({
  ...ImageDefinitionDto.shape,
  imagesRoot: z.string().min(1),
});

export type ImageDefinitionDtoType = z.infer<typeof ImageDefinitionDto>;

export type BuildAndUpsertDtoType = z.infer<typeof BuildAndUpsertDto>;
