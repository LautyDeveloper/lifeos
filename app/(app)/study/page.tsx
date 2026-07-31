import type { Metadata } from "next"

import { AreaWorkspaceView } from "@/features/areas/components/area-workspace-view"
import { getAreaWorkspace } from "@/features/areas/repository"

export const metadata: Metadata = {
  title: "Estudio",
}

export default async function StudyPage({ searchParams }: { searchParams?: Promise<{ filter?: string }> }) {
  const workspace = await getAreaWorkspace("Estudio")
  const rawFilter = (await searchParams)?.filter
  const filter = rawFilter === "today" || rawFilter === "completed" ? rawFilter : "active"

  return <AreaWorkspaceView slug="study" workspace={workspace} filter={filter} />
}
