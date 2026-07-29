import type { Metadata } from "next"

import { PlaceholderPage } from "@/features/sections/components/placeholder-page"

export const metadata: Metadata = {
  title: "Parking",
}

export default function ParkingPage() {
  return (
    <PlaceholderPage
      eyebrow="Parking"
      title="Lugar seguro para lo que todavía no merece foco."
      description="Parking queda listo para recibir ideas, proyectos o notas en pausa sin contaminar la ejecución diaria."
    />
  )
}
