import type { Metadata } from "next"

import { PlaceholderPage } from "@/features/sections/components/placeholder-page"

export const metadata: Metadata = {
  title: "Estacionados",
}

export default function ParkingPage() {
  return (
    <PlaceholderPage
      eyebrow="Estacionados"
      title="Lugar seguro para lo que todavía no merece foco."
      description="Acá van a vivir las iniciativas que querés conservar sin llevarlas a tu día."
      note="La gestión de elementos estacionados se incorporará cuando el flujo operativo lo necesite."
    />
  )
}
