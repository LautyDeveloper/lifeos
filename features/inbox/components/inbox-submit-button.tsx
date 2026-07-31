"use client"

import { LoaderCircle } from "lucide-react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"

export function InboxSubmitButton({
  label = "Capturar",
  pendingLabel = "Guardando...",
  disabled = false,
}: {
  label?: string
  pendingLabel?: string
  disabled?: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className="h-11 rounded-[18px] px-5"
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {pending ? pendingLabel : label}
    </Button>
  )
}
