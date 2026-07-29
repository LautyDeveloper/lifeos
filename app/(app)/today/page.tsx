import type { Metadata } from "next"

import { PlaceholderPage } from "@/features/sections/components/placeholder-page"

export const metadata: Metadata = {
  title: "Hoy",
}

export default function TodayPage() {
  return (
    <PlaceholderPage
      eyebrow="Hoy"
      title="Un lugar para ejecutar, no para pensar de nuevo."
      description="La vista de hoy va a concentrar lo que realmente toca hacer cuando sumemos planificación y datos reales."
    />
  )
}
