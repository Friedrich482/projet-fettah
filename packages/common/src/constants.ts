export const RESERVATION_STATUSES = [
  "pending",
  "active",
  "failed",
  "expired",
  "cancelled",
] as const;

export const WORKERS_STATUSES = ["online", "offline", "maintenance"] as const;

export const MACHINES_STATUSES = [
  "pending",
  "provisioning",
  "running",
  "stopped",
  "paused",
  "failed",
  "destroying",
  "destroyed",
] as const;
