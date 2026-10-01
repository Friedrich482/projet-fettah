import z from "zod";

import { ImageSchema as ImageDto } from "@repo/orpc-contract/reservations/types-schemas";

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
