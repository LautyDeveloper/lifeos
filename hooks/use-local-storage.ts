"use client"

import { useCallback, useSyncExternalStore, type SetStateAction } from "react"

const LOCAL_STORAGE_EVENT = "life-os:local-storage"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const readValue = useCallback(() => {
    try {
      const storedValue = window.localStorage.getItem(key)
      return storedValue ? JSON.parse(storedValue) as T : initialValue
    } catch {
      return initialValue
    }
  }, [initialValue, key])

  const subscribe = useCallback((onStoreChange: () => void) => {
    const onChange = (event: Event) => {
      if (event instanceof StorageEvent && event.key !== key) return
      onStoreChange()
    }
    window.addEventListener("storage", onChange)
    window.addEventListener(LOCAL_STORAGE_EVENT, onChange)
    return () => {
      window.removeEventListener("storage", onChange)
      window.removeEventListener(LOCAL_STORAGE_EVENT, onChange)
    }
  }, [key])

  const value = useSyncExternalStore(subscribe, readValue, () => initialValue)

  const setValue = useCallback((nextValue: SetStateAction<T>) => {
    const currentValue = readValue()
    const resolvedValue = typeof nextValue === "function"
      ? (nextValue as (current: T) => T)(currentValue)
      : nextValue
    window.localStorage.setItem(key, JSON.stringify(resolvedValue))
    window.dispatchEvent(new Event(LOCAL_STORAGE_EVENT))
  }, [key, readValue])

  return [value, setValue] as const
}
