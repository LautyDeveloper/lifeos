import { relations, sql } from "drizzle-orm"
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

export const projectStatusEnum = pgEnum("project_status", [
  "backlog",
  "active",
  "paused",
  "done",
])

export const priorityEnum = pgEnum("priority", [
  "low",
  "medium",
  "high",
  "urgent",
])

export const areas = pgTable(
  "areas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 32 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    icon: varchar("icon", { length: 64 }).notNull(),
    color: varchar("color", { length: 32 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("areas_slug_unique").on(table.slug),
    nameNotBlank: check(
      "areas_name_not_blank",
      sql`char_length(trim(${table.name})) > 0`
    ),
  })
)

export const containers = pgTable(
  "containers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    areaId: uuid("area_id")
      .notNull()
      .references(() => areas.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    archived: boolean("archived").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    areaIdx: index("containers_area_id_idx").on(table.areaId),
    nameNotBlank: check(
      "containers_name_not_blank",
      sql`char_length(trim(${table.name})) > 0`
    ),
  })
)

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    containerId: uuid("container_id")
      .notNull()
      .references(() => containers.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    status: projectStatusEnum("status").default("backlog").notNull(),
    priority: priorityEnum("priority").default("medium").notNull(),
    archivedAt: timestamp("archived_at", {
      withTimezone: true,
      mode: "date",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    containerIdx: index("projects_container_id_idx").on(table.containerId),
    statusIdx: index("projects_status_idx").on(table.status),
    archivedIdx: index("projects_archived_at_idx").on(table.archivedAt),
    titleNotBlank: check(
      "projects_title_not_blank",
      sql`char_length(trim(${table.title})) > 0`
    ),
  })
)

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    completed: boolean("completed").default(false).notNull(),
    plannedDate: timestamp("planned_date", {
      withTimezone: true,
      mode: "date",
    }),
    priority: priorityEnum("priority").default("medium").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    projectIdx: index("tasks_project_id_idx").on(table.projectId),
    plannedDateIdx: index("tasks_planned_date_idx").on(table.plannedDate),
    titleNotBlank: check(
      "tasks_title_not_blank",
      sql`char_length(trim(${table.title})) > 0`
    ),
  })
)

export const inboxItems = pgTable(
  "inbox_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content").notNull(),
    capturedAt: timestamp("captured_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    processedAt: timestamp("processed_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => ({
    capturedAtIdx: index("inbox_items_captured_at_idx").on(table.capturedAt),
    contentNotBlank: check(
      "inbox_items_content_not_blank",
      sql`char_length(trim(${table.content})) > 0`
    ),
  })
)

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    containerId: uuid("container_id").references(() => containers.id, {
      onDelete: "set null",
    }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    taskId: uuid("task_id").references(() => tasks.id, {
      onDelete: "cascade",
    }),
    title: varchar("title", { length: 180 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    archivedAt: timestamp("archived_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => ({
    containerIdx: index("notes_container_id_idx").on(table.containerId),
    projectIdx: index("notes_project_id_idx").on(table.projectId),
    taskIdx: index("notes_task_id_idx").on(table.taskId),
    titleNotBlank: check(
      "notes_title_not_blank",
      sql`char_length(trim(${table.title})) > 0`
    ),
    contentNotBlank: check(
      "notes_content_not_blank",
      sql`char_length(trim(${table.content})) > 0`
    ),
    contextShapeValid: check(
      "notes_context_shape_valid",
      sql`
        (
          ${table.containerId} is null
          and ${table.projectId} is null
          and ${table.taskId} is null
        ) or (
          ${table.containerId} is not null
          and ${table.projectId} is null
          and ${table.taskId} is null
        ) or (
          ${table.containerId} is not null
          and ${table.projectId} is not null
          and ${table.taskId} is null
        ) or (
          ${table.containerId} is not null
          and ${table.projectId} is not null
          and ${table.taskId} is not null
        )
      `
    ),
  })
)

export const areasRelations = relations(areas, ({ many }) => ({
  containers: many(containers),
}))

export const containersRelations = relations(containers, ({ one, many }) => ({
  area: one(areas, {
    fields: [containers.areaId],
    references: [areas.id],
  }),
  projects: many(projects),
  notes: many(notes),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  container: one(containers, {
    fields: [projects.containerId],
    references: [containers.id],
  }),
  tasks: many(tasks),
  notes: many(notes),
}))

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  notes: many(notes),
}))

export const notesRelations = relations(notes, ({ one }) => ({
  container: one(containers, {
    fields: [notes.containerId],
    references: [containers.id],
  }),
  project: one(projects, {
    fields: [notes.projectId],
    references: [projects.id],
  }),
  task: one(tasks, {
    fields: [notes.taskId],
    references: [tasks.id],
  }),
}))
