import z from "zod";

import { RESERVATION_STATUSES } from "@repo/common/constants";

import { ImageSchema } from "../images/types-schemas";
import {
  GetMachineOutputSchema,
  MachineSchema,
} from "../machines/types-schemas";

export const ReservationSchema = z.object({
  id: z.ulid(),
  userId: z.ulid(),
  status: z.enum(RESERVATION_STATUSES),
  duration: z.int().positive(),
  expiresAt: z.date().nullable(),
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

export const CreateReservationInputSchema = z.object({
  imageName: ImageSchema.pick({ name: true }).shape.name,
  imageTag: ImageSchema.pick({ tag: true }).shape.tag,
  duration: ReservationSchema.pick({ duration: true }).shape.duration,
  machineRam: MachineSchema.pick({ ram: true }).shape.ram,
  machineCpu: MachineSchema.pick({ cpu: true }).shape.cpu,
});

export const CreateReservationOutputSchema = z.object({
  reservation: ReservationSchema.omit({ userId: true, status: true }),
  machine: MachineSchema.omit({
    workerId: true,
    lastError: true,
    destroyedAt: true,
    containerId: true,
    reservationId: true,
    imageId: true,
    sshUsername: true,
    sshPassword: true,
    sshPort: true,
  }),
});

export const DestroyUserReservationInputSchema = ReservationSchema.pick({
  id: true,
});

export const DestroyUserReservationOutputSchema = z.object({
  reservation: ReservationSchema.omit({ userId: true }),
  machine: GetMachineOutputSchema,
});
