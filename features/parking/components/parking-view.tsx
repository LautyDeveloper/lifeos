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
        <div className="space-y-5">
          {projects.map((project) => (
            <section key={project.id} className="surface-1 rounded-[28px] border p-6 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">{project.title}</h3>
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

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="surface-2 rounded-[22px] border px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">
                    Tareas totales
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {project.taskSummary.total}
                  </p>
                </div>
                <div className="surface-2 rounded-[22px] border px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">
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
