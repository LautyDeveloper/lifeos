import type { Metadata } from "next"

import { AreaWorkspaceView } from "@/features/areas/components/area-workspace-view"
import { getAreaWorkspace } from "@/features/areas/repository"

export const metadata: Metadata = {
  title: "Dev",
}

export default async function DevPage() {
  const workspace = await getAreaWorkspace("Dev")

  return <AreaWorkspaceView slug="dev" workspace={workspace} />
}
