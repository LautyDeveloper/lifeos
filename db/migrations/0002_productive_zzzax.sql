ALTER TABLE "notes" ADD COLUMN "updated_at" timestamp with time zone;
--> statement-breakpoint
UPDATE "notes" SET "updated_at" = "created_at";
--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "updated_at" SET DEFAULT now();
--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "updated_at" SET NOT NULL;
