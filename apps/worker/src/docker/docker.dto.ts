import z from "zod";

export const ImageRefDto = z.object({
  name: z.string().trim().min(1),
  tag: z.string().trim().min(1),
});

export const EnsureNetworkDto = z.object({
  name: z.string().trim().min(1),
});

export const PullImageDto = ImageRefDto;

export const CreateAndStartContainerDto = z.object({
  image: ImageRefDto,
  name: z.string().trim().min(1),
  cpu: z.int().positive(),
  ram: z.int().positive(),
  network: z.string().trim().min(1),
  exposedPort: z.int().min(1).max(65535),
  labels: z.record(z.string(), z.string()).optional(),
});

export const ProvisionContainerDto = CreateAndStartContainerDto;

export const DestroyContainerDto = z.object({
  containerId: z.string().trim().min(1),
});

export type ImageRefDtoType = z.infer<typeof ImageRefDto>;

export type EnsureNetworkDtoType = z.infer<typeof EnsureNetworkDto>;

export type PullImageDtoType = z.infer<typeof PullImageDto>;

export type CreateAndStartContainerDtoType = z.infer<
  typeof CreateAndStartContainerDto
>;

export type ProvisionContainerDtoType = z.infer<typeof ProvisionContainerDto>;

export type DestroyContainerDtoType = z.infer<typeof DestroyContainerDto>;
