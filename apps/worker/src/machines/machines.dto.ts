import z from "zod";

import { RESERVATION_STATUSES } from "@repo/common/constants";

export const CompleteStartDto = z.object({
  machineId: z.ulid(),
  sshPort: z.int().min(1).max(65535).nullable(),
});

export const CompleteStopDto = z.object({
  machineId: z.ulid(),
});

export const CompleteDestroyDto = z.object({
  machineId: z.ulid(),
  reservationId: z.ulid(),
});

export const FailDestroyDto = z.object({
  machineId: z.ulid(),
  reservationId: z.ulid(),
  reservationStatus: z.enum(RESERVATION_STATUSES),
  error: z.unknown(),
});

export const FailMachineDto = z.object({
  machineId: z.ulid(),
  error: z.unknown(),
});

export type CompleteStartDtoType = z.infer<typeof CompleteStartDto>;

export type CompleteStopDtoType = z.infer<typeof CompleteStopDto>;

export type CompleteDestroyDtoType = z.infer<typeof CompleteDestroyDto>;

export type FailDestroyDtoType = z.infer<typeof FailDestroyDto>;

export type FailMachineDtoType = z.infer<typeof FailMachineDto>;
