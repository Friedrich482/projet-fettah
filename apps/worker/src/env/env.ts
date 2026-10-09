import z from "zod";

export const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  DATABASE_URL: z.string().trim().min(1),
  REDIS_HOST: z.hostname(),
  REDIS_PORT: z.coerce.number<number>().int().positive(),
  REDIS_HOST_PASSWORD: z.string().trim().min(1),
  WORKER_NAME: z.string().trim().min(1),
  MACHINES_NETWORK: z.string().trim().min(1),
  MACHINES_SSH_HOST_IP: z.ipv4(),
  DOCKER_SOCKET_PATH: z.string().trim().min(1),
});

export type Env = z.infer<typeof EnvSchema>;
