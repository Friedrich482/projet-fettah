import z from "zod";

import { WORKERS_STATUSES } from "@/common/constants";

const WorkerDto = z.object({
  id: z.ulid(),
  name: z.string().trim().min(1),
  status: z.enum(WORKERS_STATUSES),
  lastHeartbeatAt: z.date().exactOptional(),
});

export const CreateWorkerDto = WorkerDto.omit({ id: true });

export const FindOneWorkerDto = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("id"),
    ...WorkerDto.pick({ id: true }).shape,
  }),
  z.object({
    type: z.literal("name"),
    ...WorkerDto.pick({ name: true }).shape,
  }),
]);

export const UpdateWorkerDto = z.object({
  ...WorkerDto.pick({ id: true }).shape,
  ...WorkerDto.omit({ id: true }).exactPartial().shape,
});

export const DeleteWorkerDto = WorkerDto.pick({ id: true });

export type CreateWorkerDtoType = z.infer<typeof CreateWorkerDto>;

export type FindOneWorkerDtoType = z.infer<typeof FindOneWorkerDto>;

export type UpdateWorkerDtoType = z.infer<typeof UpdateWorkerDto>;

export type DeleteWorkerDtoType = z.infer<typeof DeleteWorkerDto>;
