import type { Metadata } from "next"

import { TodayView } from "@/features/today/components/today-view"
import { getTodayTasks } from "@/features/today/repository"

export const metadata: Metadata = {
  title: "Hoy",
}

export default async function TodayPage() {
  const tasks = await getTodayTasks()

  return <TodayView tasks={tasks} />
}
