CREATE TYPE "machine_status" AS ENUM('pending', 'provisioning', 'running', 'stopped', 'paused', 'failed', 'destroying', 'destroyed');--> statement-breakpoint
CREATE TYPE "reservation_status" AS ENUM('pending', 'active', 'failed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "workers_status" AS ENUM('online', 'offline', 'maintenance');--> statement-breakpoint
CREATE TABLE "images" (
	"id" varchar(26) PRIMARY KEY,
	"name" text NOT NULL,
	"tag" text NOT NULL,
	"digest" text,
	"exposed_port" integer NOT NULL,
	"default_cpu" integer NOT NULL,
	"default_ram" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "default_cpu_strictly_positive" CHECK ("default_cpu" > 0),
	CONSTRAINT "default_ram_strictly_positive" CHECK ("default_ram" > 0),
	CONSTRAINT "exposed_port_range" CHECK ("exposed_port" > 1024)
);
--> statement-breakpoint
CREATE TABLE "machines" (
	"id" varchar(26) PRIMARY KEY,
	"reservation_id" varchar(26) NOT NULL,
	"image_id" varchar(26) NOT NULL,
	"worker_id" varchar(26),
	"name" text NOT NULL UNIQUE,
	"cpu" integer NOT NULL,
	"ram" integer NOT NULL,
	"status" "machine_status" NOT NULL,
	"container_id" text UNIQUE,
	"last_error" text,
	"destroyed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cpu_strictly_positive" CHECK ("cpu" > 0),
	CONSTRAINT "ram_strictly_positive" CHECK ("ram" > 0)
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" varchar(26) PRIMARY KEY,
	"user_id" varchar(26) NOT NULL,
	"status" "reservation_status" NOT NULL,
	"duration" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "duration_strictly_positive" CHECK ("duration" > 0)
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" varchar(26) PRIMARY KEY,
	"name" text NOT NULL,
	"status" "workers_status" DEFAULT 'offline'::"workers_status" NOT NULL,
	"last_heartbeat_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "user_id" SET DATA TYPE varchar(26) USING "user_id"::varchar(26);--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "user_id" SET DATA TYPE varchar(26) USING "user_id"::varchar(26);--> statement-breakpoint
CREATE INDEX "machines_reservationId_idx" ON "machines" ("reservation_id");--> statement-breakpoint
CREATE INDEX "machines_imageId_idx" ON "machines" ("image_id");--> statement-breakpoint
CREATE INDEX "machines_workerId_idx" ON "machines" ("worker_id");--> statement-breakpoint
CREATE INDEX "reservations_userId_idx" ON "reservations" ("user_id");--> statement-breakpoint
ALTER TABLE "machines" ADD CONSTRAINT "machines_reservation_id_reservations_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "machines" ADD CONSTRAINT "machines_image_id_images_id_fkey" FOREIGN KEY ("image_id") REFERENCES "images"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "machines" ADD CONSTRAINT "machines_worker_id_workers_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;