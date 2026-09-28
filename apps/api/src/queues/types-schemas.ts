import z from "zod";

import {
  MachineSchema,
  ReservationSchema,
} from "@/orpc-contract/reservations/types-schemas";

export const ProvisionJobSchema = z.object({
  ...MachineSchema.pick({
    reservationId: true,
    imageId: true,
    name: true,
    cpu: true,
    ram: true,
  }).shape,
  ...ReservationSchema.pick({ duration: true }).shape,
  machineId: z.ulid(),
});

export type ProvisionJob = z.infer<typeof ProvisionJobSchema>;
