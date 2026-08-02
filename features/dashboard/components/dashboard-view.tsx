import Link from "next/link"
import { ArrowRight, ArrowUpRight, BookOpenText, CalendarCheck2, CircleDot, Inbox, Layers3 } from "lucide-react"

import { SectionHeading } from "@/components/shared/content-patterns"
import { PageShell } from "@/components/shared/page-shell"
import { EmptyState } from "@/components/ui/empty-state"
import type { DashboardSummary } from "@/features/dashboard/repository"
import { InboxForm } from "@/features/inbox/components/inbox-form"
import { LibraryCreateNoteFormInner } from "@/features/library/components/library-create-note-form"
import { priorityLabels } from "@/types/domain"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Buen día."
  if (hour < 20) return "Buenas tardes."
  return "Buenas noches."
}

function getNotePreview(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim()

  if (normalized.length <= 110) {
    return normalized
  }

  return `${normalized.slice(0, 107)}...`
}

function formatNoteDate(value: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(value)
}

const areaHrefByName: Record<string, string> = {
  Trabajo: "/work",
  Dev: "/dev",
  Estudio: "/study",
  Salud: "/health",
}

export function DashboardView({ summary }: { summary: DashboardSummary }) {
  const empty =
    summary.todayTasks.length === 0 &&
    summary.pendingInboxCount === 0 &&
    summary.activeProjectsCount === 0 &&
    summary.recentLibraryNotes.length === 0

  return (
    <PageShell eyebrow="Inicio" title={getGreeting()} description="Un vistazo tranquilo para elegir qué merece tu atención.">
      {!summary.databaseReady ? (
        <section className="surface-1 rounded-[28px] border p-6 md:p-8">
          <p className="text-lg font-medium text-white">Conectá tu base para ver el pulso del sistema.</p>
          <p className="mt-2 text-sm text-muted-foreground">La interfaz está disponible, pero todavía no hay una fuente de datos configurada.</p>
        </section>
      ) : empty ? (
        <section className="surface-1 rounded-[28px] border p-8 text-center">
          <p className="text-lg font-medium text-white">Todo está en calma.</p>
          <p className="mt-2 text-sm text-muted-foreground">Empezá con una captura o planificá una tarea para hoy.</p>
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
          <section className="surface-1 rounded-[30px] border p-6 md:p-7 xl:col-span-2">
            <SectionHeading eyebrow="Acciones rápidas" title="Movete sin cambiar de pantalla" description="Capturá, guardá contexto o saltá directo a ejecutar." action={
              <Link href="/today" className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-primary/25 bg-primary/12 px-4 text-sm font-medium text-primary transition hover:bg-primary/20 hover:text-white">
                <CalendarCheck2 className="size-4" />
                Ir a Hoy
              </Link>
            } />

            <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_1fr_0.72fr]">
              <div className="surface-2 rounded-[24px] border p-1.5">
                <InboxForm databaseReady={summary.databaseReady} compact />
              </div>
              <div className="surface-2 rounded-[24px] border p-5">
                <div className="space-y-2">
                  <p className="content-title">Nueva nota rápida</p>
                  <p className="context-line">
                    Guardá una referencia corta en Biblioteca sin salir del dashboard.
                  </p>
                </div>
                <div className="mt-4">
                  <LibraryCreateNoteFormInner compact redirectToNote={false} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <Link href="/inbox" className="surface-2 group rounded-[24px] border p-5 transition hover:border-white/[0.07] hover:bg-white/[0.03]">
                  <div className="space-y-2">
                    <Inbox className="size-5 text-primary/90" />
                    <p className="content-title text-lg">Inbox pendiente</p>
                    <p className="context-line">Capturas que todavía no tienen destino dentro del sistema.</p>
                    <div className="meta-row">
                      <span className="meta-item"><b className="text-white">{summary.pendingInboxCount}</b> por procesar</span>
                    </div>
                  </div>
                </Link>
                <div className="surface-2 rounded-[24px] border p-5">
                  <div className="space-y-2">
                    <Layers3 className="size-5 text-primary/90" />
                    <p className="content-title text-lg">Proyectos activos</p>
                    <p className="context-line">Lo que hoy sigue vivo y en foco dentro de tus áreas.</p>
                    <div className="meta-row">
                      <span className="meta-item"><b className="text-white">{summary.activeProjectsCount}</b> activos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="surface-1 rounded-[30px] border p-6 md:p-7">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="space-y-2">
                <p className="eyebrow">Tu día</p>
                <h3 className="text-2xl font-semibold tracking-[-0.035em] text-white">Lo que ya decidiste</h3>
              </div>
              <Link href="/today" className="flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:text-white">
                Ver Hoy <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-7 divide-y divide-white/[0.06]">
              {summary.todayTasks.length ? summary.todayTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-start gap-4 py-5 first:pt-0 last:pb-0">
                  <CircleDot className="mt-1 size-4 shrink-0 text-primary/85" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="content-title">{task.title}</p>
                    <p className="context-line">{task.area.name} · {task.project.title}</p>
                    <div className="meta-row">
                      <span className="meta-item">{priorityLabels[task.priority]}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No hay tareas planificadas para hoy.</p>
                  <Link href="/work" className="mt-3 inline-flex text-sm font-medium text-primary">Elegir una tarea</Link>
                </div>
              )}
            </div>
          </section>

          <section className="surface-1 rounded-[30px] border p-6 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="content-title">Notas recientes</p>
                <p className="context-line">Contexto vivo para decidir mejor.</p>
              </div>
              <Link href="/library" className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-white">
                <BookOpenText className="size-4" /> Biblioteca
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {summary.recentLibraryNotes.length ? (
                summary.recentLibraryNotes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/library?note=${note.id}`}
                    className="block rounded-[22px] border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/[0.08] hover:bg-white/[0.035]"
                  >
                    <div className="space-y-2">
                      <p className="content-title line-clamp-1">{note.title}</p>
                      <p className="context-line">{getNotePreview(note.content)}</p>
                      <div className="meta-row">
                        <span className="meta-item">Editada {formatNoteDate(note.updatedAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState
                  icon={BookOpenText}
                  title="Todavía no hay notas recientes."
                  description="Guardá una nota rápida para empezar a usar el dashboard también como contexto."
                  action={{ href: "/library", label: "Abrir Biblioteca" }}
                />
              )}
            </div>
          </section>

          <section className="surface-1 rounded-[30px] border p-6 md:p-7 xl:col-span-2">
            <SectionHeading title="Áreas" description="Dónde está viviendo tu energía." />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {summary.areas.map((area) => (
                <Link key={area.id} href={areaHrefByName[area.name] ?? "/"} className="surface-2 group rounded-[22px] border p-4 transition hover:border-primary/20 hover:bg-white/[0.045]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="content-title">{area.name}</p>
                    <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-primary" aria-hidden="true" />
                  </div>
                  <div className="meta-row mt-2">
                    <span className="meta-item"><b className="text-white">{area.projects}</b> proyectos</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </PageShell>
  )
}
