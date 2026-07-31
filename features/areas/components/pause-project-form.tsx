"use client"

import { useTransition } from "react"
import { PauseCircle } from "lucide-react"

import { pauseProjectAction } from "@/features/areas/actions"
import { Button } from "@/components/ui/button"

export function PauseProjectForm({
  projectId,
  path,
}: {
  projectId: string
  path: string
}) {
  const [pending, startTransition] = useTransition()

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          await pauseProjectAction(formData)
        })
      }
    >
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="path" value={path} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending}
        className="min-h-9 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.05]"
      >
        <PauseCircle className="size-3.5" />
        Parking
      </Button>
    </form>
  )
}
