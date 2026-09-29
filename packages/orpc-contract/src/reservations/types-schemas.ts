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

export const ImageSchema = z.object({
  id: z.ulid(),
  name: z
    .string()
    .max(255)
    .regex(
      /^(?:(?:(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])(?:\.(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]))*|\[(?:[a-fA-F0-9:]+)\])(?::[0-9]+)?\/)?[a-z0-9]+(?:(?:[._]|__|[-]+)[a-z0-9]+)*(?:\/[a-z0-9]+(?:(?:[._]|__|[-]+)[a-z0-9]+)*)*$/,
      { error: "The image name must be a valid Docker image name" },
    ),
  tag: z.string().regex(/^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/, {
    error: "The image tag must be a valid Docker tag",
  }),
  digest: z.hash("sha256"),
  exposedPort: z.int().min(1024).max(65535),
  defaultCpu: z.int().positive(),
  defaultRam: z.int().positive(),
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
  }),
});
