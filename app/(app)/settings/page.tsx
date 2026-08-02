import type { Metadata } from "next"

import { SettingsView } from "@/features/settings/components/settings-view"
import { getSystemSetup } from "@/features/settings/repository"

export const metadata: Metadata = {
  title: "Configuración",
}

export default function SettingsPage() {
  return <SettingsPageContent />
}

async function SettingsPageContent() {
  const setup = await getSystemSetup()

  return <SettingsView setup={setup} />
}
