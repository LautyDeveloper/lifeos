import Link from "next/link"
import { ArrowRight, BookOpenText, CalendarCheck2, CircleDot, Inbox, Layers3 } from "lucide-react"

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
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="eyebrow">Quick actions</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-white">Movete sin cambiar de pantalla</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  Capturá, guardá contexto o saltá directo a ejecutar.
                </p>
              </div>
              <Link href="/today" className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-primary/15 bg-primary/12 px-4 text-sm font-medium text-primary transition hover:border-primary/20 hover:bg-primary/18 hover:text-white">
                <CalendarCheck2 className="size-4" />
                Ir a Hoy
              </Link>
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_1fr_0.72fr]">
              <div className="surface-2 rounded-[24px] border p-1.5">
                <InboxForm databaseReady={summary.databaseReady} compact />
              </div>
              <div className="surface-2 rounded-[24px] border p-5">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-white">Nueva nota rápida</p>
                  <p className="text-sm leading-7 text-muted-foreground">
                    Guardá una referencia corta en Biblioteca sin salir del dashboard.
                  </p>
                </div>
                <div className="mt-4">
                  <LibraryCreateNoteFormInner compact redirectToNote={false} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <Link href="/inbox" className="surface-2 group rounded-[24px] border p-5 transition hover:border-white/[0.07] hover:bg-white/[0.03]">
                  <Inbox className="size-5 text-primary/90" />
                  <p className="mt-5 text-3xl font-semibold text-white">{summary.pendingInboxCount}</p>
                  <p className="mt-1 text-sm text-muted-foreground">capturas por procesar</p>
                </Link>
                <div className="surface-2 rounded-[24px] border p-5">
                  <Layers3 className="size-5 text-primary/90" />
                  <p className="mt-5 text-3xl font-semibold text-white">{summary.activeProjectsCount}</p>
                  <p className="mt-1 text-sm text-muted-foreground">proyectos activos</p>
                </div>
              </div>
            </div>
          </section>

          <section className="surface-1 rounded-[30px] border p-6 md:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Tu día</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-white">Lo que ya decidiste</h3>
              </div>
              <Link href="/today" className="flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:text-white">
                Ver Hoy <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-7 divide-y divide-white/[0.06]">
              {summary.todayTasks.length ? summary.todayTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-start gap-4 py-5 first:pt-0 last:pb-0">
                  <CircleDot className="mt-1 size-4 shrink-0 text-primary/85" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{task.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{task.area.name} · {task.project.title}</p>
                  </div>
                  <span className="chip-subtle px-2.5 py-1 text-[11px]">{priorityLabels[task.priority]}</span>
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
              <div>
                <p className="text-sm font-medium text-white">Notas recientes</p>
                <p className="mt-1 text-sm leading-7 text-muted-foreground">Contexto vivo para decidir mejor.</p>
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
                    <div className="flex items-start justify-between gap-3">
                      <p className="line-clamp-1 text-sm font-medium text-white">{note.title}</p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatNoteDate(note.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {getNotePreview(note.content)}
                    </p>
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
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">Áreas</p>
                <p className="mt-1 text-sm leading-7 text-muted-foreground">Dónde está viviendo tu energía.</p>
              </div>
              <Link href="/library" className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-white">
                <BookOpenText className="size-4" /> Biblioteca
              </Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {summary.areas.map((area) => (
                <div key={area.id} className="surface-2 rounded-[22px] border p-4">
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
