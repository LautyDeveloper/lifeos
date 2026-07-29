"use client"

import { createContext, useContext, useMemo, useState } from "react"

import { useLocalStorage } from "@/hooks/use-local-storage"

type SidebarStateContextValue = {
  collapsed: boolean
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  toggleCollapsed: () => void
  toggleMobile: () => void
}

const STORAGE_KEY = "life-os.sidebar-collapsed"

const SidebarStateContext = createContext<SidebarStateContextValue | null>(null)

export function SidebarStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useLocalStorage(STORAGE_KEY, false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const value = useMemo(
    () => ({
      collapsed,
      mobileOpen,
      setMobileOpen,
      toggleCollapsed: () => setCollapsed((current) => !current),
      toggleMobile: () => setMobileOpen((current) => !current),
    }),
    [collapsed, mobileOpen, setCollapsed]
  )

  return (
    <SidebarStateContext.Provider value={value}>
      {children}
    </SidebarStateContext.Provider>
  )
}

export function useSidebarState() {
  const context = useContext(SidebarStateContext)

  if (!context) {
    throw new Error("useSidebarState must be used within SidebarStateProvider")
  }

  return context
}
