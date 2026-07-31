import { AppShell } from "@/components/layout/app-shell"
import { db } from "@/db"
import { ToastProvider } from "@/components/ui/toast-provider"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ToastProvider><AppShell databaseReady={Boolean(db)}>{children}</AppShell></ToastProvider>
}
