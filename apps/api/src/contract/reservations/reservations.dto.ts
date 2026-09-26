import z from "zod";

export const FindAllReservationsDto = z.object({
  userId: z.ulid(),
});

export type FindAllReservationsDtoType = z.infer<typeof FindAllReservationsDto>;
