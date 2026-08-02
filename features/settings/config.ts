export const areaIconOptions = [
  "BriefcaseBusiness",
  "MonitorCog",
  "BookOpen",
  "HeartPulse",
  "House",
  "Rocket",
  "FolderKanban",
  "Sparkles",
] as const

export const areaColorOptions = [
  "#7dd3fc",
  "#60a5fa",
  "#a78bfa",
  "#34d399",
  "#f59e0b",
  "#fb7185",
  "#f472b6",
  "#a3e635",
] as const

export type AreaIconOption = (typeof areaIconOptions)[number]
export type AreaColorOption = (typeof areaColorOptions)[number]

export const areaIconLabels: Record<AreaIconOption, string> = {
  BriefcaseBusiness: "Trabajo",
  MonitorCog: "Dev",
  BookOpen: "Estudio",
  HeartPulse: "Salud",
  House: "Casa",
  Rocket: "Lanzamiento",
  FolderKanban: "Sistema",
  Sparkles: "General",
}

export const defaultAreaMetadataBySlug = {
  work: {
    name: "Trabajo",
    icon: "BriefcaseBusiness",
    color: "#7dd3fc",
  },
  dev: {
    name: "Dev",
    icon: "MonitorCog",
    color: "#60a5fa",
  },
  study: {
    name: "Estudio",
    icon: "BookOpen",
    color: "#a78bfa",
  },
  health: {
    name: "Salud",
    icon: "HeartPulse",
    color: "#34d399",
  },
} as const

export type AreaSlug = keyof typeof defaultAreaMetadataBySlug
