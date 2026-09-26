import z from "zod";

import { GetUserReservationInputSchema as GetUserReservationDto } from "@/orpc-contract/reservations/types-schemas";

export const FindOneReservationDto = GetUserReservationDto.extend({
  userId: z.ulid(),
});

export type FindOneReservationDtoType = z.infer<typeof FindOneReservationDto>;

export const FindAllReservationsDto = z.object({
  userId: z.ulid(),
});

export type FindAllReservationsDtoType = z.infer<typeof FindAllReservationsDto>;
