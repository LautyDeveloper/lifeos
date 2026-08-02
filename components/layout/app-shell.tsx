"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppTopbar } from "@/components/layout/app-topbar"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { MobileMoreSheet } from "@/components/layout/mobile-more-sheet"
import { GlobalCapture } from "@/features/inbox/components/global-capture"
import {
  SidebarStateProvider,
  useSidebarState,
} from "@/components/layout/sidebar-state-provider"
import type { NavigationGroupData } from "@/types/navigation"

function AppShellFrame({
  children,
  databaseReady,
  navigationGroups,
}: {
  children: React.ReactNode
  databaseReady: boolean
  navigationGroups: NavigationGroupData[]
}) {
  const {
    collapsed,
    mobileOpen,
    setMobileOpen,
    toggleCollapsed,
  } = useSidebarState()

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1760px] gap-4 px-3 py-3 md:px-4 xl:gap-8 xl:px-7 xl:py-6">
        <div className="hidden md:block">
          <AppSidebar
            collapsed={collapsed}
            navigationGroups={navigationGroups}
            onToggleCollapsed={toggleCollapsed}
          />
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <AppTopbar navigationGroups={navigationGroups} />
          <main className="flex-1 px-3 py-6 pb-28 sm:px-4 md:pb-8 xl:px-7 xl:py-10">{children}</main>
        </div>
      </div>

      <MobileMoreSheet navigationGroups={navigationGroups} open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <GlobalCapture databaseReady={databaseReady} />
      <MobileBottomNav navigationGroups={navigationGroups} />
    </div>
  )
}

export function AppShell({
  children,
  databaseReady,
  navigationGroups,
}: {
  children: React.ReactNode
  databaseReady: boolean
  navigationGroups: NavigationGroupData[]
}) {
  return (
    <SidebarStateProvider>
      <AppShellFrame databaseReady={databaseReady} navigationGroups={navigationGroups}>{children}</AppShellFrame>
    </SidebarStateProvider>
  )
}
