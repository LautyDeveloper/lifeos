export const projectStatusValues = [
  "backlog",
  "active",
  "paused",
  "done",
] as const

export type ProjectStatus = (typeof projectStatusValues)[number]

export const visibleAreaProjectStatusValues = [
  "backlog",
  "active",
  "done",
] as const

export type VisibleAreaProjectStatus = (typeof visibleAreaProjectStatusValues)[number]

export const priorityValues = [
  "low",
  "medium",
  "high",
  "urgent",
] as const

export type Priority = (typeof priorityValues)[number]

export const projectStatusLabels: Record<ProjectStatus, string> = {
  backlog: "Pendiente",
  active: "Activo",
  paused: "En pausa",
  done: "Terminado",
}

export const projectStatusSectionLabels: Record<VisibleAreaProjectStatus, string> = {
  active: "Activos",
  backlog: "Backlog",
  done: "Completados",
}

export const priorityLabels: Record<Priority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
}

export function canCreateTasksInProject(status: ProjectStatus) {
  return status === "active" || status === "backlog"
}

export function canPlanTasksInProject(status: ProjectStatus) {
  return status === "active"
}

export function canMutateTasksInProject(status: ProjectStatus) {
  return status === "active" || status === "backlog"
}

export function canEditTask(status: ProjectStatus, completed: boolean) {
  return canMutateTasksInProject(status) && !completed
}

export function canPlanTask(status: ProjectStatus, completed: boolean) {
  return canPlanTasksInProject(status) && !completed
}

export function isProjectVisibleInArea(status: ProjectStatus) {
  return status !== "paused"
}

export function isProjectVisibleInToday(status: ProjectStatus) {
  return status === "active"
}
