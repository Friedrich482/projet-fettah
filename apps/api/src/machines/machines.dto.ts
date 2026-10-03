import z from "zod";

import { MachineSchema as MachineDto } from "@repo/orpc-contract/machines/types-schemas";

export const CreateMachineDto = z.object({
  ...MachineDto.omit({
    id: true,
    containerId: true,
    sshUsername: true,
    sshPassword: true,
    sshPort: true,
  }).shape,
  ...MachineDto.pick({
    containerId: true,
  }).exactPartial().shape,
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

export const FindOneMachineOwnedByUserDto = z.object({
  userId: z.ulid(),
  machineId: z.ulid(),
});

export const FindAllMachinesOwnedByUserDto = z.object({
  userId: z.ulid(),
});

export const UpdateMachineDto = z.object({
  ...MachineDto.pick({ id: true }).shape,
  ...MachineDto.omit({ id: true }).exactPartial().shape,
});

export const DeleteMachineDto = MachineDto.pick({ id: true });

export const TransitionMachineStatusDto = z.object({
  ...MachineDto.pick({ id: true }).shape,
  from: z.array(MachineDto.pick({ status: true }).shape.status).min(1),
  to: MachineDto.pick({ status: true }).shape.status,
});

export type CreateMachineDtoType = z.infer<typeof CreateMachineDto>;

export type FindOneMachineDtoType = z.infer<typeof FindOneMachineDto>;

export type FindOneMachineOwnedByUserDtoType = z.infer<
  typeof FindOneMachineOwnedByUserDto
>;

export type FindAllMachinesOwnedByUserDtoType = z.infer<
  typeof FindAllMachinesOwnedByUserDto
>;

export type UpdateMachineDtoType = z.infer<typeof UpdateMachineDto>;

export type DeleteMachineDtoType = z.infer<typeof DeleteMachineDto>;

export type TransitionMachineStatusDtoType = z.infer<
  typeof TransitionMachineStatusDto
>;
