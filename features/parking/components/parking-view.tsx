import { PauseCircle } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { MetricCard } from "@/components/shared/content-patterns"
import { EmptyState } from "@/components/ui/empty-state"
import { ResumeProjectForm } from "@/features/parking/components/resume-project-form"
import type { ParkingProject } from "@/features/parking/repository"
import { priorityLabels, projectStatusLabels } from "@/types/domain"

export function ParkingView({ projects }: { projects: ParkingProject[] }) {
  return (
    <PageShell
      eyebrow="Estacionados"
      title="Sacá proyectos del foco sin perderlos."
      description="Todo lo que hoy no merece atención activa puede quedar estacionado acá, sin ruido y sin borrarlo."
    >
      {projects.length > 0 ? (
        <div className="space-y-5">
          {projects.map((project) => (
            <section key={project.id} className="surface-1 rounded-[28px] border p-6 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="space-y-2.5">
                  <p className="content-title text-xl">{project.title}</p>
                  <p className="context-line">
                    {project.area.name} · {project.container.name}
                  </p>
                  {project.description ? (
                    <p className="context-line max-w-2xl">
                      {project.description}
                    </p>
                  ) : null}
                  <div className="meta-row">
                    <span className="meta-item">{projectStatusLabels[project.status]}</span>
                    <span className="meta-item">{priorityLabels[project.priority]}</span>
                  </div>
                </div>
                <ResumeProjectForm projectId={project.id} path="/parking" />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <MetricCard label="Tareas totales" value={project.taskSummary.total} />
                <MetricCard label="Pendientes" value={project.taskSummary.pending} />
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={PauseCircle}
          title="No hay proyectos estacionados."
          description="Si algo hoy no merece foco, podés mandarlo a Estacionados desde cualquiera de tus áreas."
        />
      )}
    </PageShell>
  )
}
