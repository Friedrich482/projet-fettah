import z from "zod";

import { WORKERS_STATUSES } from "@repo/common/constants";

export const IdentifyWorkerDto = z.object({
  name: z.string().trim().min(1),
});

export const RecordHeartbeatDto = z.object({
  id: z.string().trim().min(1),
  lastHeartbeatAt: z.date(),
});

export const SetWorkerStatusDto = z.object({
  id: z.string().trim().min(1),
  status: z.enum(WORKERS_STATUSES),
});

export type IdentifyWorkerDtoType = z.infer<typeof IdentifyWorkerDto>;

export type RecordHeartbeatDtoType = z.infer<typeof RecordHeartbeatDto>;

export type SetWorkerStatusDtoType = z.infer<typeof SetWorkerStatusDto>;
