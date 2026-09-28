ALTER TABLE "images" RENAME CONSTRAINT "digest" TO "images_digest_key";--> statement-breakpoint
ALTER TABLE "workers" ADD CONSTRAINT "workers_name_key" UNIQUE("name");