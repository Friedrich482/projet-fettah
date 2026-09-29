ALTER TABLE "machines"
DROP CONSTRAINT "machines_worker_id_workers_id_fkey",
ADD CONSTRAINT "machines_worker_id_workers_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers" ("id") ON DELETE SET NULL;