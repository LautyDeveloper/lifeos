import type { Metadata } from "next"

import { AreaWorkspaceView } from "@/features/areas/components/area-workspace-view"
import { getAreaWorkspace } from "@/features/areas/repository"

export const metadata: Metadata = {
  title: "Estudio",
}

export default async function StudyPage() {
  const workspace = await getAreaWorkspace("Estudio")

  return <AreaWorkspaceView slug="study" workspace={workspace} />
}
