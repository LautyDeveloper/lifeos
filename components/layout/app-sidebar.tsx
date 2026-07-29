"use client"

import { PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { cn } from "@/lib/utils"

type AppSidebarProps = {
  collapsed: boolean
  mobile?: boolean
  onCloseMobile?: () => void
  onToggleCollapsed: () => void
}

export function AppSidebar({
  collapsed,
  mobile = false,
  onCloseMobile,
  onToggleCollapsed,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "surface-1 flex h-full flex-col rounded-[28px] border",
        mobile ? "w-full max-w-[320px] p-3" : collapsed ? "w-20 p-3" : "w-72 p-4"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className={cn("flex items-center gap-3", collapsed && !mobile && "justify-center")}>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/16 text-primary ring-1 ring-inset ring-primary/25">
            <Sparkles className="size-5" />
          </div>
          {!collapsed || mobile ? (
            <div>
              <p className="text-sm font-semibold tracking-tight text-white">Life OS</p>
              <p className="text-xs text-muted-foreground">Capture. Organize. Execute.</p>
            </div>
          ) : null}
        </div>

        {!mobile ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden md:inline-flex"
            onClick={onToggleCollapsed}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        ) : null}
      </div>

      <div className="mt-6 flex-1 overflow-y-auto">
        <SidebarNav collapsed={collapsed && !mobile} onNavigate={onCloseMobile} />
      </div>

      <div className="mt-4 rounded-3xl border border-white/6 bg-white/[0.03] p-4">
        {!collapsed || mobile ? (
          <>
            <p className="text-sm font-medium text-white">Sistema listo para crecer</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Base visual, rutas y esquema preparados para empezar a construir producto.
            </p>
          </>
        ) : (
          <div className="flex justify-center">
            <Sparkles className="size-4 text-primary" />
          </div>
        )}
      </div>
    </aside>
  )
}
