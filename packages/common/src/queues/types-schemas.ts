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
