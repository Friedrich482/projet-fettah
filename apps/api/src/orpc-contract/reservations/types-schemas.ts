import z from "zod";

import { RESERVATION_STATUSES } from "@/common/constants";

export const ReservationSchema = z.object({
  id: z.ulid(),
  userId: z.ulid(),
  status: z.enum(RESERVATION_STATUSES),
  duration: z.int().positive(),
  expiresAt: z.date(),
  endedAt: z.date().nullable(),
});

export const GetUserReservationsOutputSchema = z.array(
  ReservationSchema.omit({ userId: true }),
);

export const GetUserReservationInputSchema = ReservationSchema.pick({
  id: true,
});

export const GetUserReservationOutputSchema = ReservationSchema.omit({
  userId: true,
});
