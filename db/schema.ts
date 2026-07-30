import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
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

export const areas = pgTable("areas", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  icon: varchar("icon", { length: 64 }).notNull(),
  color: varchar("color", { length: 32 }).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
})

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
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    areaIdx: index("containers_area_id_idx").on(table.areaId),
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
  })
)

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    containerId: uuid("container_id").references(() => containers.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 180 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    containerIdx: index("notes_container_id_idx").on(table.containerId),
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
}))

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
}))

export const notesRelations = relations(notes, ({ one }) => ({
  container: one(containers, {
    fields: [notes.containerId],
    references: [containers.id],
  }),
}))
