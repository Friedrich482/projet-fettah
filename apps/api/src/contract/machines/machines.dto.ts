import z from "zod";

import {
  ConnectMachineInputSchema,
  GetMachineInputSchema,
} from "@repo/orpc-contract/machines/types-schemas";

export const GetMachineDto = GetMachineInputSchema.extend({
  userId: z.ulid(),
});

export const ConnectMachineDto = ConnectMachineInputSchema.extend({
  userId: z.ulid(),
});

export type GetMachineDtoType = z.infer<typeof GetMachineDto>;

export type ConnectMachineDtoType = z.infer<typeof ConnectMachineDto>;
