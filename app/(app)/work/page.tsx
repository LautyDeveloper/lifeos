import type { Metadata } from "next"

import { AreaWorkspaceView } from "@/features/areas/components/area-workspace-view"
import { getAreaWorkspace } from "@/features/areas/repository"

export const metadata: Metadata = {
  title: "Trabajo",
}

export default async function WorkPage({ searchParams }: { searchParams?: Promise<{ filter?: string }> }) {
  const workspace = await getAreaWorkspace("Trabajo")
  const rawFilter = (await searchParams)?.filter
  const filter = rawFilter === "today" || rawFilter === "completed" ? rawFilter : "active"

  return <AreaWorkspaceView slug="work" workspace={workspace} filter={filter} />
}
