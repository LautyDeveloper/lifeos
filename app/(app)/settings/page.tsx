import type { Metadata } from "next"

import { PlaceholderPage } from "@/features/sections/components/placeholder-page"

export const metadata: Metadata = {
  title: "Configuración",
}

export default function SettingsPage() {
  return (
    <PlaceholderPage
      eyebrow="Configuración"
      title="Preferencias simples para un sistema personal."
      description="Solo los ajustes que realmente cambien cómo trabajás van a vivir acá."
      note="Por ahora Life OS usa una experiencia oscura y una estructura común para todos los espacios."
    />
  )
}
