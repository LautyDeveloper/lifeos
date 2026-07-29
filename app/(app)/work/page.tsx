import type { Metadata } from "next"

import { PlaceholderPage } from "@/features/sections/components/placeholder-page"

export const metadata: Metadata = {
  title: "Trabajo",
}

export default function WorkPage() {
  return (
    <PlaceholderPage
      eyebrow="Trabajo"
      title="Área preparada para foco profesional."
      description="Acá va a vivir el contexto operativo de trabajo con proyectos, contenedores y ejecución diaria."
    />
  )
}
