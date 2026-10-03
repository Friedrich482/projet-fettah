import z from "zod";

export const ImageRefDto = z.object({
  name: z.string().trim().min(1),
  tag: z.string().trim().min(1),
});

export const EnsureNetworkDto = z.object({
  name: z.string().trim().min(1),
});

export const BuildImageDto = z.object({
  contextPath: z.string().trim().min(1),
  dockerfile: z.string().trim().min(1),
  name: z.string().trim().min(1),
  tag: z.string().trim().min(1),
});

export const CreateAndStartContainerDto = z.object({
  image: ImageRefDto,
  name: z.string().trim().min(1),
  cpu: z.int().positive(),
  ram: z.int().positive(),
  network: z.string().trim().min(1),
  exposedPort: z.int().min(1).max(65535),
  hostIp: z.string(),
  labels: z.record(z.string(), z.string()).optional(),
});

export const ProvisionContainerDto = CreateAndStartContainerDto;

export const SetContainerPasswordDto = z.object({
  containerId: z.string().trim().min(1),
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export const DestroyContainerDto = z.object({
  containerId: z.string().trim().min(1),
});

export const StartContainerDto = z.object({
  containerId: z.string().trim().min(1),
});

export const StopContainerDto = z.object({
  containerId: z.string().trim().min(1),
});

export type ImageRefDtoType = z.infer<typeof ImageRefDto>;

export type EnsureNetworkDtoType = z.infer<typeof EnsureNetworkDto>;

export type BuildImageDtoType = z.infer<typeof BuildImageDto>;

export type CreateAndStartContainerDtoType = z.infer<
  typeof CreateAndStartContainerDto
>;

export type ProvisionContainerDtoType = z.infer<typeof ProvisionContainerDto>;

export type SetContainerPasswordDtoType = z.infer<
  typeof SetContainerPasswordDto
>;

export type DestroyContainerDtoType = z.infer<typeof DestroyContainerDto>;

export type StartContainerDtoType = z.infer<typeof StartContainerDto>;

export type StopContainerDtoType = z.infer<typeof StopContainerDto>;
