import z from "zod";

export const ProvisionJobSchema = z.object({
  reservationId: z.ulid(),
  imageId: z.ulid(),
  name: z.string().trim().min(1),
  cpu: z.int().positive(),
  ram: z.int().positive(),
  duration: z.int().positive(),
  machineId: z.ulid(),
});

export type ProvisionJob = z.infer<typeof ProvisionJobSchema>;

export const DestroyJobSchema = z.object({
  reservationId: z.ulid(),
  machineId: z.ulid(),
  name: z.string().trim().min(1),
  containerId: z.string().trim().min(1),
});

export type DestroyJob = z.infer<typeof DestroyJobSchema>;

export const StartJobSchema = z.object({
  machineId: z.ulid(),
  name: z.string().trim().min(1),
  containerId: z.string().trim().min(1),
});

export type StartJob = z.infer<typeof StartJobSchema>;
