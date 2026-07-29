"use client"

import { LoaderCircle } from "lucide-react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"

export function InboxSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 rounded-2xl bg-primary px-5 text-primary-foreground hover:bg-primary/90"
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {pending ? "Guardando..." : "Capturar"}
    </Button>
  )
}
