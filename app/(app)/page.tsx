import { DashboardView } from "@/features/dashboard/components/dashboard-view"
import { getDashboardSummary } from "@/features/dashboard/repository"

export default async function DashboardPage() {
  const summary = await getDashboardSummary()
  return <DashboardView summary={summary} />
}
