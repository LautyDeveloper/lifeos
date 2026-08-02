import { AppShell } from "@/components/layout/app-shell"
import { db } from "@/db"
import { ToastProvider } from "@/components/ui/toast-provider"
import { buildNavigationGroups } from "@/features/navigation/navigation.config"
import { getAreaNavigationItems } from "@/features/navigation/repository"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navigationGroups = buildNavigationGroups(await getAreaNavigationItems())

  return <ToastProvider><AppShell databaseReady={Boolean(db)} navigationGroups={navigationGroups}>{children}</AppShell></ToastProvider>
}
