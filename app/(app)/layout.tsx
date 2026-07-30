import { AppShell } from "@/components/layout/app-shell"
import { db } from "@/db"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell databaseReady={Boolean(db)}>{children}</AppShell>
}
