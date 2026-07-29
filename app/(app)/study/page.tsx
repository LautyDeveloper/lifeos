import type { Metadata } from "next"

import { PlaceholderPage } from "@/features/sections/components/placeholder-page"

export const metadata: Metadata = {
  title: "Estudio",
}

export default function StudyPage() {
  return (
    <PlaceholderPage
      eyebrow="Estudio"
      title="Espacio reservado para aprendizaje estructurado."
      description="Esta página ya soporta la futura capa de notas, materiales, planificación y seguimiento sin cambiar el shell."
    />
  )
}
