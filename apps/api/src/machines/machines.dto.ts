import z from "zod";

import { MACHINES_STATUSES } from "@/common/constants";

const MachineDto = z.object({
  id: z.ulid(),
  reservationId: z.ulid(),
  imageId: z.ulid(),
  workerId: z.ulid().exactOptional(),
  name: z.string().trim().min(1),
  cpu: z.int().positive(),
  ram: z.int().positive(),
  status: z.enum(MACHINES_STATUSES),
  containerId: z.string().trim().min(1).exactOptional(),
  lastError: z.string().trim().min(1).exactOptional(),
  destroyedAt: z.date().exactOptional(),
});

export const CreateMachineDto = z.object({
  ...MachineDto.omit({ id: true, containerId: true }).shape,
  ...MachineDto.pick({ containerId: true }).exactPartial().shape,
});

export const FindOneMachineDto = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("id"),
    ...MachineDto.pick({ id: true }).shape,
  }),
  z.object({
    type: z.literal("name"),
    ...MachineDto.pick({ name: true }).shape,
  }),
  z.object({
    type: z.literal("containerId"),
    ...MachineDto.pick({ containerId: true }).required().shape,
  }),
]);

export const UpdateMachineDto = z.object({
  ...MachineDto.pick({ id: true }).shape,
  ...MachineDto.omit({ id: true }).exactPartial().shape,
});

export const DeleteMachineDto = MachineDto.pick({ id: true });

export type CreateMachineDtoType = z.infer<typeof CreateMachineDto>;

export type FindOneMachineDtoType = z.infer<typeof FindOneMachineDto>;

export type UpdateMachineDtoType = z.infer<typeof UpdateMachineDto>;

export type DeleteMachineDtoType = z.infer<typeof DeleteMachineDto>;
