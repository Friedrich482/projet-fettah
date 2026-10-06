import z from "zod";

import {
  ConnectMachineInputSchema,
  GetMachineInputSchema,
  StartMachineInputSchema,
  StopMachineInputSchema,
} from "@repo/orpc-contract/machines/types-schemas";

export const GetMachineDto = GetMachineInputSchema.extend({
  userId: z.ulid(),
});

export const FindAllMachinesDto = z.object({
  userId: z.ulid(),
});

export const ConnectMachineDto = ConnectMachineInputSchema.extend({
  userId: z.ulid(),
});

export const StartMachineDto = StartMachineInputSchema.extend({
  userId: z.ulid(),
});

export const StopMachineDto = StopMachineInputSchema.extend({
  userId: z.ulid(),
});

export type GetMachineDtoType = z.infer<typeof GetMachineDto>;

export type FindAllMachinesDtoType = z.infer<typeof FindAllMachinesDto>;

export type ConnectMachineDtoType = z.infer<typeof ConnectMachineDto>;

export type StartMachineDtoType = z.infer<typeof StartMachineDto>;

export type StopMachineDtoType = z.infer<typeof StopMachineDto>;
