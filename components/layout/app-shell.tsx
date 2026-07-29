"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppTopbar } from "@/components/layout/app-topbar"
import {
  SidebarStateProvider,
  useSidebarState,
} from "@/components/layout/sidebar-state-provider"

function AppShellFrame({ children }: { children: React.ReactNode }) {
  const {
    collapsed,
    mobileOpen,
    setMobileOpen,
    toggleCollapsed,
    toggleMobile,
  } = useSidebarState()

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1720px] gap-4 px-3 py-3 md:px-4 xl:gap-6 xl:px-6 xl:py-5">
        <div className="hidden md:block">
          <AppSidebar
            collapsed={collapsed}
            onToggleCollapsed={toggleCollapsed}
          />
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <AppTopbar onOpenMobile={toggleMobile} />
          <main className="flex-1 px-4 py-6 xl:px-6 xl:py-8">{children}</main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex bg-black/60 p-3 backdrop-blur-sm md:hidden">
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
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarStateProvider>
      <AppShellFrame>{children}</AppShellFrame>
    </SidebarStateProvider>
  )
}
