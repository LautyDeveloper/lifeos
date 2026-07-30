"use client"

import { createContext, useContext, useMemo, useState } from "react"

import { useLocalStorage } from "@/hooks/use-local-storage"

type SidebarStateContextValue = {
  areasOpen: boolean
  collapsed: boolean
  mobileOpen: boolean
  setAreasOpen: (open: boolean) => void
  setMobileOpen: (open: boolean) => void
  toggleCollapsed: () => void
  toggleMobile: () => void
}

const STORAGE_KEY = "life-os.sidebar-collapsed"
const AREAS_STORAGE_KEY = "life-os.areas-open"

const SidebarStateContext = createContext<SidebarStateContextValue | null>(null)

export function SidebarStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useLocalStorage(STORAGE_KEY, false)
  const [areasOpen, setAreasOpen] = useLocalStorage(AREAS_STORAGE_KEY, true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const value = useMemo(
    () => ({
      areasOpen,
      collapsed,
      mobileOpen,
      setAreasOpen,
      setMobileOpen,
      toggleCollapsed: () => setCollapsed((current) => !current),
      toggleMobile: () => setMobileOpen((current) => !current),
    }),
    [areasOpen, collapsed, mobileOpen, setAreasOpen, setCollapsed]
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
