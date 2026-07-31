"use client"

import { useTransition } from "react"
import { PlayCircle } from "lucide-react"

import { resumeProjectAction } from "@/features/areas/actions"
import { Button } from "@/components/ui/button"

export function ResumeProjectForm({
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
          await resumeProjectAction(formData)
        })
      }
    >
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="path" value={path} />
      <Button
        type="submit"
        size="sm"
        disabled={pending}
        className="min-h-9 rounded-xl"
      >
        <PlayCircle className="size-3.5" />
        Reanudar
      </Button>
    </form>
  )
}
