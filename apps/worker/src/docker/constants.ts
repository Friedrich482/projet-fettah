export const DOCKER_CLIENT = "DOCKER_CLIENT";

export const NANOCPUS_PER_MILLICPU = 1_000_000;
export const BYTES_PER_MEGABYTE = 1024 * 1024;
export const BUILD_TIMEOUT_MS = 1_800_000;
export const EXEC_TIMEOUT_MS = 60_000;
export const EXEC_POLL_INTERVAL_MS = 100;

// Docker answers 304 when a start or a stop was a no-op because the container
// was already in the requested state.
export const HTTP_NOT_MODIFIED = 304;

// Docker answers 404 when the container is already gone, which for a destroy is
// the desired end state rather than a failure.
export const HTTP_NOT_FOUND = 404;
