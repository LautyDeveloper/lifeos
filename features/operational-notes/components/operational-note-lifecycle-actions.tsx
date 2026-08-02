"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Archive, RotateCcw, Trash2 } from "lucide-react"

import {
  archiveOperationalNoteAction,
  deleteOperationalNoteAction,
  restoreOperationalNoteAction,
} from "@/features/operational-notes/actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type LifecycleMode = "active" | "archived"

export function OperationalNoteLifecycleActions({
  noteId,
  path,
  mode,
}: {
  noteId: string
  path: string
  mode: LifecycleMode
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string>()
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  function runAction(
    action: (formData: FormData) => Promise<{ status: "success" | "error"; message: string }>
  ) {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("id", noteId)
      formData.set("path", path)

      const result = await action(formData)
      setMessage(result.message)
      setMessageType(result.status)

      if (result.status === "success") {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {mode === "active" ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.05]"
            disabled={pending}
            onClick={() => runAction(archiveOperationalNoteAction)}
          >
            <Archive className="size-4" />
            Archivar
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.05]"
              disabled={pending}
              onClick={() => runAction(restoreOperationalNoteAction)}
            >
              <RotateCcw className="size-4" />
              Restaurar
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11 rounded-xl"
              disabled={pending}
              onClick={() => runAction(deleteOperationalNoteAction)}
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          </>
        )}
      </div>
      {message ? (
        <p
          className={cn(
            "min-h-5 text-sm",
            messageType === "success" ? "text-primary/90" : "text-destructive"
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}
