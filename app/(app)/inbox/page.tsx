import type { Metadata } from "next"

import { PlaceholderPage } from "@/features/sections/components/placeholder-page"

export const metadata: Metadata = {
  title: "Inbox",
}

export default function InboxPage() {
  return (
    <PlaceholderPage
      eyebrow="Inbox"
      title="Capturar tiene que ser instantáneo."
      description="Esta pantalla queda lista para ser la puerta de entrada de ideas, tareas y notas sin fricción."
    />
  )
}
