import z from "zod";

export const HealthOutputSchema = z.object({
  ok: z.literal(true),
});

export type HealthOutputSchemaType = z.infer<typeof HealthOutputSchema>;
