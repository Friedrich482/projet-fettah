import z from "zod";

import { RESERVATION_STATUSES } from "@/common/constants";

const ReservationDto = z.object({
  id: z.ulid(),
  userId: z.ulid(),
  status: z.enum(RESERVATION_STATUSES),
  duration: z.int().positive(),
  expiresAt: z.date(),
  endedAt: z.date().exactOptional(),
});

export const CreateReservationDto = z.object({
  ...ReservationDto.omit({ id: true }).shape,
});

export const FindOneReservationDto = ReservationDto.pick({ id: true });

export const UpdateReservationDto = z.object({
  ...ReservationDto.pick({ id: true }).shape,
  ...ReservationDto.omit({ id: true }).exactPartial().shape,
});

export const DeleteReservationDto = ReservationDto.pick({ id: true });

export type CreateReservationDtoType = z.infer<typeof CreateReservationDto>;

export type FindOneReservationDtoType = z.infer<typeof FindOneReservationDto>;

export type UpdateReservationDtoType = z.infer<typeof UpdateReservationDto>;

export type DeleteReservationDtoType = z.infer<typeof DeleteReservationDto>;
