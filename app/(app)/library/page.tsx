import type { Metadata } from "next"

import { PlaceholderPage } from "@/features/sections/components/placeholder-page"

export const metadata: Metadata = {
  title: "Biblioteca",
}

export default function LibraryPage() {
  return (
    <PlaceholderPage
      eyebrow="Biblioteca"
      title="Colección lista para recursos y referencias."
      description="Esta vista nace preparada para albergar conocimiento, notas y materiales sin romper la simplicidad del sistema."
    />
  )
}
