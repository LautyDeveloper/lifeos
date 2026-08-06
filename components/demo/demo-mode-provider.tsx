"use client"

import { createContext, useContext } from "react"

const DemoModeContext = createContext({ readOnly: false })

export function DemoModeProvider({
  children,
  readOnly,
}: {
  children: React.ReactNode
  readOnly: boolean
}) {
  return <DemoModeContext.Provider value={{ readOnly }}>{children}</DemoModeContext.Provider>
}

export function useDemoMode() {
  return useContext(DemoModeContext)
}
