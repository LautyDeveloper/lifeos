import type { Metadata } from "next"

import { AreaWorkspaceView } from "@/features/areas/components/area-workspace-view"
import { getAreaWorkspace } from "@/features/areas/repository"

export const metadata: Metadata = {
  title: "Salud",
}

export default async function HealthPage() {
  const workspace = await getAreaWorkspace("Salud")

  return <AreaWorkspaceView slug="health" workspace={workspace} />
}
