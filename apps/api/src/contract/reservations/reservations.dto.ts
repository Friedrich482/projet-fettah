import z from "zod";

import {
  CreateReservationInputSchema,
  DestroyUserReservationInputSchema as DestroyUserReservationDto,
  GetUserReservationInputSchema as GetUserReservationDto,
} from "@repo/orpc-contract/reservations/types-schemas";

export const CreateReservationDto = CreateReservationInputSchema.extend({
  userId: z.ulid(),
});

export const FindOneReservationDto = GetUserReservationDto.extend({
  userId: z.ulid(),
});

export const DestroyReservationDto = DestroyUserReservationDto.extend({
  userId: z.ulid(),
});

export const FindAllReservationsDto = z.object({
  userId: z.ulid(),
});

export type CreateReservationDtoType = z.infer<typeof CreateReservationDto>;

export type FindOneReservationDtoType = z.infer<typeof FindOneReservationDto>;

export type DestroyReservationDtoType = z.infer<typeof DestroyReservationDto>;

export type FindAllReservationsDtoType = z.infer<typeof FindAllReservationsDto>;
