import { InboxProcessDialog } from "@/features/inbox/components/inbox-process-dialog"

type InboxItem = {
  id: string
  content: string
  capturedAt: Date
  processedAt: Date | null
}

type AreaWithContainers = {
  id: string
  name: string
  containers: { id: string; name: string }[]
}

type ProjectOption = {
  id: string
  title: string
  containerName: string
  areaName: string
}

function formatCapturedAt(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function InboxList({
  items,
  areasWithContainers,
  projectOptions,
  databaseReady,
}: {
  items: InboxItem[]
  areasWithContainers: AreaWithContainers[]
  projectOptions: ProjectOption[]
  databaseReady: boolean
}) {
  if (items.length === 0) {
    return (
      <section className="surface-1 rounded-[32px] border p-6 md:p-8">
        <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-center">
          <p className="text-base font-medium text-white">Todavía no hay capturas.</p>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-muted-foreground">
            Cuando una idea aparezca, entra acá primero. Ordenar viene después.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="surface-1 rounded-[32px] border p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">Inbox actual</p>
          <p className="text-sm text-muted-foreground">
            Lo más reciente aparece primero para mantener el momentum.
          </p>
        </div>
        <div className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground">
          {items.length} capturas
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm leading-7 text-white">{item.content}</p>
              <InboxProcessDialog
                item={{
                  id: item.id,
                  content: item.content,
                }}
                areasWithContainers={areasWithContainers}
                projectOptions={projectOptions}
                databaseReady={databaseReady}
              />
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Capturado {formatCapturedAt(item.capturedAt)}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
