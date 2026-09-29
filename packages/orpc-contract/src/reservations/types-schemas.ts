import z from "zod";

import {
  MACHINES_STATUSES,
  RESERVATION_STATUSES,
} from "@repo/common/constants";

export const ReservationSchema = z.object({
  id: z.ulid(),
  userId: z.ulid(),
  status: z.enum(RESERVATION_STATUSES),
  duration: z.int().positive(),
  expiresAt: z.date().nullable(),
  endedAt: z.date().nullable(),
});

export const MachineSchema = z.object({
  id: z.ulid(),
  reservationId: z.ulid(),
  imageId: z.ulid(),
  workerId: z.ulid().nullable(),
  name: z.string().trim().min(1),
  cpu: z.int().positive(),
  ram: z.int().positive(),
  status: z.enum(MACHINES_STATUSES),
  containerId: z.string().trim().min(1).nullable(),
  lastError: z.string().trim().min(1).nullable(),
  destroyedAt: z.date().nullable(),
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

export const CreateReservationInputSchema = z.object({
  imageId: z.ulid(),
  duration: z.int().positive(),
});

export const CreateReservationOutputSchema = z.object({
  reservation: ReservationSchema.omit({ userId: true }),
  machine: MachineSchema.omit({
    workerId: true,
    lastError: true,
    destroyedAt: true,
    containerId: true,
  }),
});
