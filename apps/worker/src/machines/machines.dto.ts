import z from "zod";

export const CompleteStartDto = z.object({
  machineId: z.ulid(),
  sshPort: z.int().min(1).max(65535).nullable(),
});

export const FailMachineDto = z.object({
  machineId: z.ulid(),
  error: z.unknown(),
});

export type CompleteStartDtoType = z.infer<typeof CompleteStartDto>;

export type FailMachineDtoType = z.infer<typeof FailMachineDto>;
