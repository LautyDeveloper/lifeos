CREATE UNIQUE INDEX "areas_slug_unique" ON "areas" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "areas" ADD CONSTRAINT "areas_name_not_blank" CHECK (char_length(trim("areas"."name")) > 0);--> statement-breakpoint
ALTER TABLE "containers" ADD CONSTRAINT "containers_name_not_blank" CHECK (char_length(trim("containers"."name")) > 0);--> statement-breakpoint
ALTER TABLE "inbox_items" ADD CONSTRAINT "inbox_items_content_not_blank" CHECK (char_length(trim("inbox_items"."content")) > 0);--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_title_not_blank" CHECK (char_length(trim("notes"."title")) > 0);--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_content_not_blank" CHECK (char_length(trim("notes"."content")) > 0);--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_context_shape_valid" CHECK (
        (
          "notes"."container_id" is null
          and "notes"."project_id" is null
          and "notes"."task_id" is null
        ) or (
          "notes"."container_id" is not null
          and "notes"."project_id" is null
          and "notes"."task_id" is null
        ) or (
          "notes"."container_id" is not null
          and "notes"."project_id" is not null
          and "notes"."task_id" is null
        ) or (
          "notes"."container_id" is not null
          and "notes"."project_id" is not null
          and "notes"."task_id" is not null
        )
      );--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_title_not_blank" CHECK (char_length(trim("projects"."title")) > 0);--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_title_not_blank" CHECK (char_length(trim("tasks"."title")) > 0);