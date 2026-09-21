import z from "zod";

export const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  PORT: z.coerce.number<number>().int().positive(),
  SERVER_URL: z.url(),
});

export type Env = z.infer<typeof EnvSchema>;
