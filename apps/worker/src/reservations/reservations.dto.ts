import z from "zod";

export const ClaimMachineDto = z.object({
  machineId: z.ulid(),
  workerId: z.ulid(),
});

export const CompleteProvisionDto = z.object({
  machineId: z.ulid(),
  reservationId: z.ulid(),
  containerId: z.string().trim().min(1),
  sshPort: z.int().min(1).max(65535),
  sshPassword: z.string().min(1),
  duration: z.int().positive(),
});

export const FailMachineDto = z.object({
  machineId: z.ulid(),
  error: z.unknown(),
});

export type ClaimMachineDtoType = z.infer<typeof ClaimMachineDto>;

export type CompleteProvisionDtoType = z.infer<typeof CompleteProvisionDto>;

export type FailMachineDtoType = z.infer<typeof FailMachineDto>;
