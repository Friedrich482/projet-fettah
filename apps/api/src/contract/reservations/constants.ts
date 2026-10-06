import type { MACHINES_STATUSES } from "@repo/common/constants";

export const DESTROYABLE_STATUSES: Array<(typeof MACHINES_STATUSES)[number]> = [
  "running",
  "stopped",
  "paused",
  "failed",
];
