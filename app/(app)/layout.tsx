import { AppShell } from "@/components/layout/app-shell"
import { db } from "@/db"
import { ToastProvider } from "@/components/ui/toast-provider"
import { listAreasWithContainers, listProjectOptions } from "@/features/inbox/repository"
import { buildNavigationGroups } from "@/features/navigation/navigation.config"
import { getAreaNavigationItems } from "@/features/navigation/repository"
import { DemoModeProvider } from "@/components/demo/demo-mode-provider"
import { isDemoReadOnly } from "@/lib/demo-mode"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [navigationItems, areasWithContainers, projectOptions] = await Promise.all([
    getAreaNavigationItems(),
    listAreasWithContainers(),
    listProjectOptions(),
  ])
  const navigationGroups = buildNavigationGroups(navigationItems)

  return (
    <DemoModeProvider readOnly={isDemoReadOnly()}>
      <ToastProvider>
        <AppShell
        databaseReady={Boolean(db)}
        navigationGroups={navigationGroups}
        areasWithContainers={areasWithContainers}
        projectOptions={projectOptions}
      >
        {children}
        </AppShell>
      </ToastProvider>
    </DemoModeProvider>
  )
}
