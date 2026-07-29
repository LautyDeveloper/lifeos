import type { Metadata } from "next"

import { PlaceholderPage } from "@/features/sections/components/placeholder-page"

export const metadata: Metadata = {
  title: "Dev",
}

export default function DevPage() {
  return (
    <PlaceholderPage
      eyebrow="Dev"
      title="Base lista para proyectos técnicos."
      description="La sección de desarrollo queda conectada al mismo sistema visual y preparada para sumar workflows específicos más adelante."
    />
  )
}
