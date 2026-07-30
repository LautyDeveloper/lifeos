import type { Metadata } from "next"

import { AreaWorkspaceView } from "@/features/areas/components/area-workspace-view"
import { getAreaWorkspace } from "@/features/areas/repository"

export const metadata: Metadata = {
  title: "Trabajo",
}

export default async function WorkPage() {
  const workspace = await getAreaWorkspace("Trabajo")

  return <AreaWorkspaceView slug="work" workspace={workspace} />
}
