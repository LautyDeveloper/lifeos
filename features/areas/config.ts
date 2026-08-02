export const areaPageConfig = {
  work: {
    eyebrow: "Trabajo",
    title: "Trabajo con foco, estructura y seguimiento.",
    description:
      "Tus espacios, proyectos y tareas activas en una sola vista, sin ruido.",
  },
  dev: {
    eyebrow: "Dev",
    title: "Proyectos técnicos con contexto operativo real.",
    description:
      "Desde la hoja de ruta hasta la ejecución puntual, mirá el estado vivo de tus productos y tareas.",
  },
  study: {
    eyebrow: "Estudio",
    title: "Aprendizaje estructurado, convertido en acción.",
    description:
      "Materias, proyectos de estudio y tareas concretas en una sola superficie clara y accionable.",
  },
  health: {
    eyebrow: "Salud",
    title: "Bienestar con estructura simple y consistente.",
    description:
      "Rutinas, objetivos operativos y tareas activas para sostener hábitos sin fricción mental.",
  },
} as const

export type AreaPageSlug = keyof typeof areaPageConfig
