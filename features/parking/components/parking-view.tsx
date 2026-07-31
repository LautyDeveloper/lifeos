import { PauseCircle } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { PriorityBadge, StatusBadge } from "@/components/ui/badges"
import { EmptyState } from "@/components/ui/empty-state"
import { ResumeProjectForm } from "@/features/parking/components/resume-project-form"
import type { ParkingProject } from "@/features/parking/repository"

export function ParkingView({ projects }: { projects: ParkingProject[] }) {
  return (
    <PageShell
      eyebrow="Parking"
      title="Sacá proyectos del foco sin perderlos."
      description="Todo lo que hoy no merece atención activa puede quedar estacionado acá, sin ruido y sin borrarlo."
    >
      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <section key={project.id} className="surface-1 rounded-2xl border p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                    <StatusBadge status={project.status} />
                    <PriorityBadge priority={project.priority} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {project.area.name} · {project.container.name}
                  </p>
                  {project.description ? (
                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                      {project.description}
                    </p>
                  ) : null}
                </div>
                <ResumeProjectForm projectId={project.id} path="/parking" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Tareas totales
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {project.taskSummary.total}
                  </p>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Pendientes
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {project.taskSummary.pending}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={PauseCircle}
          title="No hay proyectos estacionados."
          description="Si algo hoy no merece foco, podés mandarlo a Parking desde cualquiera de tus áreas."
        />
      )}
    </PageShell>
  )
}
