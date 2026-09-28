import z from "zod";

export const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  PORT: z.coerce.number<number>().int().positive(),
  SERVER_URL: z.url(),
  DATABASE_URL: z.string().trim().min(1),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z
    .base64()
    .refine(
      (value) => value.length >= 32,
      "BETTER_AUTH_SECRET must be at least 32 characters",
    ),
  REDIS_HOST: z.hostname(),
  REDIS_PORT: z.coerce.number<number>().int().positive(),
  REDIS_HOST_PASSWORD: z.string().trim().min(1),
});

export type Env = z.infer<typeof EnvSchema>;
