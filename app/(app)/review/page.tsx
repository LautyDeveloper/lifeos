import type { Metadata } from "next"

import { ReviewView } from "@/features/review/components/review-view"
import { getReviewSummary } from "@/features/review/repository"

export const metadata: Metadata = {
  title: "Review",
}

export default async function ReviewPage() {
  const summary = await getReviewSummary()

  return <ReviewView summary={summary} />
}
