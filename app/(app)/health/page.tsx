import type { Metadata } from "next"

import { PlaceholderPage } from "@/features/sections/components/placeholder-page"

export const metadata: Metadata = {
  title: "Salud",
}

export default function HealthPage() {
  return (
    <PlaceholderPage
      eyebrow="Salud"
      title="Un área pensada para sostener hábitos y bienestar."
      description="La infraestructura está preparada para sumar seguimiento personal sin mezclarlo con el resto del sistema."
    />
  )
}
