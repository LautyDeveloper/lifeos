import type { Metadata } from "next"

import { db } from "@/db"
import { ReviewView } from "@/features/review/components/review-view"
import { listAreasWithContainers, listProjectOptions } from "@/features/inbox/repository"
import { getReviewSummary } from "@/features/review/repository"

export const metadata: Metadata = {
  title: "Review",
}

export default async function ReviewPage() {
  const [summary, areasWithContainers, projectOptions] = await Promise.all([
    getReviewSummary(),
    listAreasWithContainers(),
    listProjectOptions(),
  ])

  return (
    <ReviewView
      summary={summary}
      areasWithContainers={areasWithContainers}
      projectOptions={projectOptions}
      databaseReady={Boolean(db)}
    />
  )
}
