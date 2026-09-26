import z from "zod";

import { ReservationSchema as ReservationDto } from "@/orpc-contract/reservations/types-schemas";

export const CreateReservationDto = z.object({
  ...ReservationDto.omit({ id: true }).shape,
});

export const FindOneReservationDto = ReservationDto.pick({ id: true });

export const FindAllReservationsDto = z.object({
  userId: z.ulid(),
});

export const UpdateReservationDto = z.object({
  ...ReservationDto.pick({ id: true }).shape,
  ...ReservationDto.omit({ id: true }).exactPartial().shape,
});

export const DeleteReservationDto = ReservationDto.pick({ id: true });

export type CreateReservationDtoType = z.infer<typeof CreateReservationDto>;

export type FindOneReservationDtoType = z.infer<typeof FindOneReservationDto>;

export type FindAllReservationsDtoType = z.infer<typeof FindAllReservationsDto>;

export type UpdateReservationDtoType = z.infer<typeof UpdateReservationDto>;

export type DeleteReservationDtoType = z.infer<typeof DeleteReservationDto>;
