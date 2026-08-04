import type { Metadata } from "next"

import { TodayView } from "@/features/today/components/today-view"
import { getExecutionBoard } from "@/features/today/repository"

export const metadata: Metadata = {
  title: "Hoy",
}

export default async function TodayPage() {
  const board = await getExecutionBoard()

  return <TodayView board={board} />
}
