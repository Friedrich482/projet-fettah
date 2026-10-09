import z from "zod";

import { ReservationSchema as ReservationDto } from "@repo/orpc-contract/reservations/types-schemas";

export const CreateReservationDto = z.object({
  ...ReservationDto.omit({ id: true }).shape,
});

export const FindOneReservationDto = ReservationDto.pick({
  id: true,
  userId: true,
});

export const FindAllReservationsDto = z.object({
  userId: z.ulid(),
});

export const UpdateReservationDto = z.object({
  ...ReservationDto.pick({ id: true }).shape,
  ...ReservationDto.omit({ id: true }).exactPartial().shape,
});

export const DeleteReservationDto = ReservationDto.pick({ id: true });

export const TransitionReservationStatusDto = z.object({
  ...ReservationDto.pick({ id: true }).shape,
  from: z.array(ReservationDto.pick({ status: true }).shape.status).min(1),
  to: ReservationDto.pick({ status: true }).shape.status,
  endedAt: ReservationDto.pick({ endedAt: true }).shape.endedAt,
});

export type CreateReservationDtoType = z.infer<typeof CreateReservationDto>;

export type FindOneReservationDtoType = z.infer<typeof FindOneReservationDto>;

export type FindAllReservationsDtoType = z.infer<typeof FindAllReservationsDto>;

export type UpdateReservationDtoType = z.infer<typeof UpdateReservationDto>;

export type DeleteReservationDtoType = z.infer<typeof DeleteReservationDto>;

export type TransitionReservationStatusDtoType = z.infer<
  typeof TransitionReservationStatusDto
>;
