"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppTopbar } from "@/components/layout/app-topbar"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { GlobalCapture } from "@/features/inbox/components/global-capture"
import {
  SidebarStateProvider,
  useSidebarState,
} from "@/components/layout/sidebar-state-provider"

function AppShellFrame({ children, databaseReady }: { children: React.ReactNode; databaseReady: boolean }) {
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
            onToggleCollapsed={toggleCollapsed}
          />
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <AppTopbar />
          <main className="flex-1 px-3 py-6 pb-28 sm:px-4 md:pb-8 xl:px-7 xl:py-10">{children}</main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex bg-black/65 p-3 backdrop-blur-md md:hidden">
          <button
            type="button"
            aria-label="Cerrar navegación"
            className="absolute inset-0"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full">
            <AppSidebar
              mobile
              collapsed={false}
              onCloseMobile={() => setMobileOpen(false)}
              onToggleCollapsed={toggleCollapsed}
            />
          </div>
        </div>
      ) : null}
      <GlobalCapture databaseReady={databaseReady} />
      <MobileBottomNav />
    </div>
  )
}

export function AppShell({ children, databaseReady }: { children: React.ReactNode; databaseReady: boolean }) {
  return (
    <SidebarStateProvider>
      <AppShellFrame databaseReady={databaseReady}>{children}</AppShellFrame>
    </SidebarStateProvider>
  )
}
