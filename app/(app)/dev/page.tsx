import type { Metadata } from "next"

import { AreaWorkspaceView } from "@/features/areas/components/area-workspace-view"
import { getAreaWorkspace } from "@/features/areas/repository"

export const metadata: Metadata = {
  title: "Dev",
}

export default async function DevPage({ searchParams }: { searchParams?: Promise<{ filter?: string }> }) {
  const workspace = await getAreaWorkspace("Dev")
  const rawFilter = (await searchParams)?.filter
  const filter = rawFilter === "today" || rawFilter === "completed" ? rawFilter : "active"

  return <AreaWorkspaceView slug="dev" workspace={workspace} filter={filter} />
}
