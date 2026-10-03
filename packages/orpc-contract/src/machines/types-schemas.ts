import z from "zod";

import { MACHINES_STATUSES } from "@repo/common/constants";

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
  sshUsername: z.string().trim().min(1),
  sshPassword: z.string().min(1).nullable(),
  sshPort: z.int().min(1).max(65535).nullable(),
  lastError: z.string().trim().min(1).nullable(),
  destroyedAt: z.date().nullable(),
});

export const GetMachineInputSchema = MachineSchema.pick({
  id: true,
});

export const GetMachineOutputSchema = MachineSchema.omit({
  workerId: true,
  containerId: true,
  lastError: true,
  sshUsername: true,
  sshPassword: true,
  sshPort: true,
});

export const GetMachinesOutputSchema = z.array(GetMachineOutputSchema);

export const ConnectMachineInputSchema = MachineSchema.pick({
  id: true,
});

export const ConnectMachineOutputSchema = z.object({
  machineId: MachineSchema.pick({ id: true }).shape.id,
  status: MachineSchema.pick({ status: true }).shape.status,
  host: z.ipv4(),
  port: MachineSchema.pick({ sshPort: true }).shape.sshPort.unwrap(),
  username: MachineSchema.pick({ sshUsername: true }).shape.sshUsername,
  password: MachineSchema.pick({
    sshPassword: true,
  }).shape.sshPassword.unwrap(),
});

export const StartMachineInputSchema = MachineSchema.pick({
  id: true,
});

export const StartMachineOutputSchema = GetMachineOutputSchema;
