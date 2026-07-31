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
        "surface-1 flex h-full flex-col rounded-[28px] border transition-[width,padding] duration-200 motion-reduce:transition-none",
        mobile ? "w-full max-w-[332px] p-3.5" : collapsed ? "w-20 p-3" : "w-[18.5rem] p-4"
      )}
    >
      <div className={cn("flex items-center justify-between gap-3", collapsed && !mobile && "flex-col")}>
        <div className={cn("flex items-center gap-3", collapsed && !mobile && "justify-center")}>
          <div className="flex size-11 items-center justify-center rounded-[18px] border border-primary/14 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <Sparkles className="size-5" />
          </div>
          {!collapsed || mobile ? (
            <div className="space-y-0.5">
              <p className="text-sm font-semibold tracking-[-0.03em] text-white">Life OS</p>
              <p className="text-[11px] text-muted-foreground">Capturá. Decidí. Avanzá.</p>
            </div>
          ) : null}
        </div>

        {!mobile ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden md:inline-flex"
            onClick={onToggleCollapsed}
            title={collapsed ? "Expandir navegación" : "Contraer navegación"}
            aria-label={collapsed ? "Expandir navegación" : "Contraer navegación"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        ) : null}
      </div>

      <div className="mt-6 flex-1 overflow-y-auto">
        <SidebarNav collapsed={collapsed && !mobile} onNavigate={onCloseMobile} />
      </div>

      <div className="surface-2 mt-5 rounded-[22px] border p-4">
        {!collapsed || mobile ? (
          <>
            <p className="text-sm font-medium text-white">Un lugar para cada cosa</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              Capturá lo que aparece y volvé a lo que importa.
            </p>
          </>
        ) : (
          <div className="flex justify-center">
            <Sparkles className="size-4 text-primary/85" />
          </div>
        )}
      </div>
    </aside>
  )
}
