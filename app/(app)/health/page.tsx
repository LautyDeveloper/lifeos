import type { Metadata } from "next"

import { AreaWorkspaceView } from "@/features/areas/components/area-workspace-view"
import { getAreaWorkspace } from "@/features/areas/repository"

export const metadata: Metadata = {
  title: "Salud",
}

export default async function HealthPage({ searchParams }: { searchParams?: Promise<{ filter?: string }> }) {
  const workspace = await getAreaWorkspace("health")
  const rawFilter = (await searchParams)?.filter
  const filter = rawFilter === "today" || rawFilter === "completed" ? rawFilter : "active"

  return <AreaWorkspaceView slug="health" workspace={workspace} filter={filter} />
}
