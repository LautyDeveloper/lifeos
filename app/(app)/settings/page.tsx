import type { Metadata } from "next"

import { PlaceholderPage } from "@/features/sections/components/placeholder-page"

export const metadata: Metadata = {
  title: "Configuración",
}

export default function SettingsPage() {
  return (
    <PlaceholderPage
      eyebrow="Configuración"
      title="Configuración mínima, producto opinado."
      description="La sección existe, pero la filosofía se mantiene: menos perillas, más decisiones bien tomadas desde el diseño."
    />
  )
}
