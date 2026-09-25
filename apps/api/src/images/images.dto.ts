import z from "zod";

const ImageDto = z.object({
  id: z.ulid(),
  name: z.string().min(1).max(256),
  tag: z
    .string()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
      { error: "The image tag must be a semantic version" },
    ),
  digest: z.hash("sha256"),
  exposedPort: z.int().min(1024).max(65535),
  defaultCpu: z.int().positive(),
  defaultRam: z.int().positive(),
});

export const CreateImageDto = z.object({
  ...ImageDto.omit({ id: true, digest: true }).shape,
  ...ImageDto.pick({ digest: true }).exactPartial().shape,
});

export const FindOneImageDto = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("id"),
    ...ImageDto.pick({ id: true }).shape,
  }),
  z.object({
    type: z.literal("name-tag"),
    ...ImageDto.pick({ name: true, tag: true }).shape,
  }),
  z.object({
    type: z.literal("digest"),
    ...ImageDto.pick({ digest: true }).shape,
  }),
]);

export const UpdateImageDto = z.object({
  ...ImageDto.pick({ id: true }).shape,
  ...ImageDto.omit({ id: true }).exactPartial().shape,
});

export const DeleteImageDto = ImageDto.pick({ id: true });

export type CreateImageDtoType = z.infer<typeof CreateImageDto>;

export type FindOneImageDtoType = z.infer<typeof FindOneImageDto>;

export type UpdateImageDtoType = z.infer<typeof UpdateImageDto>;

export type DeleteImageDtoType = z.infer<typeof DeleteImageDto>;
