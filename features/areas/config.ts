export const areaPageConfig = {
  work: {
    areaName: "Trabajo",
    eyebrow: "Trabajo",
    title: "Trabajo con foco, estructura y seguimiento.",
    description:
      "Tus containers, proyectos y tareas activas viven acá. Todo lo importante del trabajo, sin ruido.",
  },
  dev: {
    areaName: "Dev",
    eyebrow: "Dev",
    title: "Proyectos técnicos con contexto operativo real.",
    description:
      "Desde roadmap hasta ejecución puntual, esta vista muestra el estado vivo de tus productos y tareas.",
  },
  study: {
    areaName: "Estudio",
    eyebrow: "Estudio",
    title: "Aprendizaje estructurado, convertido en acción.",
    description:
      "Materias, proyectos de estudio y tareas concretas en una sola superficie clara y accionable.",
  },
  health: {
    areaName: "Salud",
    eyebrow: "Salud",
    title: "Bienestar con estructura simple y consistente.",
    description:
      "Rutinas, objetivos operativos y tareas activas para sostener hábitos sin fricción mental.",
  },
} as const

export type AreaPageSlug = keyof typeof areaPageConfig
