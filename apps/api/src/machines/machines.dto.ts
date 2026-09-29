import z from "zod";

import { MachineSchema as MachineDto } from "@repo/orpc-contract/reservations/types-schemas";

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
    containerId: MachineDto.pick({
      containerId: true,
    }).shape.containerId.unwrap(),
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
