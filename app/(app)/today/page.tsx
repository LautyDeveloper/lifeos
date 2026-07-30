import type { Metadata } from "next"

import { TodayView } from "@/features/today/components/today-view"
import { getTodayProgress, getTodayTasks } from "@/features/today/repository"

export const metadata: Metadata = {
  title: "Hoy",
}

export default async function TodayPage() {
  const [tasks, progress] = await Promise.all([getTodayTasks(), getTodayProgress()])

  return <TodayView tasks={tasks} progress={progress} />
}
