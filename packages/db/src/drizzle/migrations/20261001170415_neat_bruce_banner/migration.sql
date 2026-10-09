ALTER TABLE "machines" ADD COLUMN "ssh_username" text DEFAULT 'root' NOT NULL;--> statement-breakpoint
ALTER TABLE "machines" ADD COLUMN "ssh_password" text;--> statement-breakpoint
ALTER TABLE "machines" ADD COLUMN "ssh_port" integer;--> statement-breakpoint
ALTER TABLE "images" DROP CONSTRAINT "exposed_port_range", ADD CONSTRAINT "exposed_port_range" CHECK ("exposed_port" >= 1 AND "exposed_port" <= 65535);