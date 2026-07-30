import Link from "next/link"
import { ArrowRight, BookOpenText, CircleDot, Inbox, Layers3 } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import type { DashboardSummary } from "@/features/dashboard/repository"

const priorityLabels: Record<string, string> = {
  urgent: "Urgente",
  high: "Alta",
  medium: "Media",
  low: "Baja",
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Buen día."
  if (hour < 20) return "Buenas tardes."
  return "Buenas noches."
}

export function DashboardView({ summary }: { summary: DashboardSummary }) {
  const empty =
    summary.todayTasks.length === 0 &&
    summary.pendingCaptures === 0 &&
    summary.activeProjects === 0

  return (
    <PageShell eyebrow="Inicio" title={getGreeting()} description="Un vistazo tranquilo para elegir qué merece tu atención.">
      {!summary.databaseReady ? (
        <section className="surface-1 rounded-2xl border p-6 md:p-8">
          <p className="text-lg font-medium text-white">Conectá tu base para ver el pulso del sistema.</p>
          <p className="mt-2 text-sm text-muted-foreground">La interfaz está disponible, pero todavía no hay una fuente de datos configurada.</p>
        </section>
      ) : empty ? (
        <section className="surface-1 rounded-2xl border p-8 text-center">
          <p className="text-lg font-medium text-white">Todo está en calma.</p>
          <p className="mt-2 text-sm text-muted-foreground">Empezá con una captura o planificá una tarea para hoy.</p>
        </section>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
          <section className="surface-1 rounded-2xl border p-5 md:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Tu día</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Lo que ya decidiste</h3>
              </div>
              <Link href="/today" className="flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:text-white">
                Ver Hoy <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-6 divide-y divide-white/8">
              {summary.todayTasks.length ? summary.todayTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                  <CircleDot className="mt-1 size-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{task.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{task.area.name} · {task.project.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{priorityLabels[task.priority]}</span>
                </div>
              )) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No hay tareas planificadas para hoy.</p>
                  <Link href="/work" className="mt-3 inline-flex text-sm font-medium text-primary">Elegir una tarea</Link>
                </div>
              )}
            </div>
          </section>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
            <Link href="/inbox" className="surface-1 group rounded-2xl border p-5 transition hover:border-primary/25">
              <Inbox className="size-5 text-primary" />
              <p className="mt-5 text-3xl font-semibold text-white">{summary.pendingCaptures}</p>
              <p className="mt-1 text-sm text-muted-foreground">capturas por procesar</p>
            </Link>
            <div className="surface-1 rounded-2xl border p-5">
              <Layers3 className="size-5 text-primary" />
              <p className="mt-5 text-3xl font-semibold text-white">{summary.activeProjects}</p>
              <p className="mt-1 text-sm text-muted-foreground">proyectos activos</p>
            </div>
          </div>

          <section className="surface-1 rounded-2xl border p-5 md:p-6 xl:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">Áreas</p>
                <p className="mt-1 text-sm text-muted-foreground">Dónde está viviendo tu energía.</p>
              </div>
              <Link href="/library" className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-white">
                <BookOpenText className="size-4" /> Biblioteca
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {summary.areas.map((area) => (
                <div key={area.id} className="rounded-xl bg-white/[0.025] p-4">
                  <p className="text-sm font-medium text-white">{area.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{area.projects} proyectos</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </PageShell>
  )
}
