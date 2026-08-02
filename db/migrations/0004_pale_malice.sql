ALTER TABLE "areas" ADD COLUMN "slug" varchar(32);--> statement-breakpoint
ALTER TABLE "areas" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "containers" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint

UPDATE "areas"
SET
  "slug" = CASE
    WHEN "name" = 'Trabajo' THEN 'work'
    WHEN "name" = 'Dev' THEN 'dev'
    WHEN "name" = 'Estudio' THEN 'study'
    WHEN "name" = 'Salud' THEN 'health'
    ELSE lower(regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g'))
  END,
  "sort_order" = CASE
    WHEN "name" = 'Trabajo' THEN 0
    WHEN "name" = 'Dev' THEN 1
    WHEN "name" = 'Estudio' THEN 2
    WHEN "name" = 'Salud' THEN 3
    ELSE "sort_order"
  END;--> statement-breakpoint

WITH ordered_containers AS (
  SELECT
    "id",
    row_number() OVER (
      PARTITION BY "area_id"
      ORDER BY "created_at", "name"
    ) - 1 AS row_number
  FROM "containers"
)
UPDATE "containers"
SET "sort_order" = ordered_containers.row_number
FROM ordered_containers
WHERE "containers"."id" = ordered_containers."id";--> statement-breakpoint

ALTER TABLE "areas" ALTER COLUMN "slug" SET NOT NULL;
