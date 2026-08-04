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
  aiEnabled,
}: {
  items: InboxItem[]
  areasWithContainers: AreaWithContainers[]
  projectOptions: ProjectOption[]
  databaseReady: boolean
  aiEnabled: boolean
}) {
  if (items.length === 0) {
    return (
      <section className="surface-1 rounded-[28px] border p-6 md:p-8">
        <div className="px-5 py-12 text-center">
          <p className="text-base font-medium text-white">Todavía no hay capturas.</p>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-muted-foreground">
            Cuando una idea aparezca, entra acá primero. Ordenar viene después.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="surface-1 rounded-[28px] border p-6 md:p-7">
      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="space-y-1">
          <p className="eyebrow">Inbox activo</p>
          <p className="content-title text-lg">Por decidir</p>
          <p className="context-line">
            Lo más reciente aparece primero.
          </p>
        </div>
        <div className="meta-row md:justify-end">
          <span className="meta-item"><b className="text-white">{items.length}</b> capturas</span>
        </div>
      </div>

      <div className="mt-6 divide-y divide-white/[0.06]">
        {items.map((item) => (
          <article
            key={item.id}
            className="py-5 first:pt-0 last:pb-0"
          >
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div className="space-y-2">
                <p className="text-base leading-8 text-white">{item.content}</p>
                <div className="meta-row">
                  <span className="meta-item">Capturado {formatCapturedAt(item.capturedAt)}</span>
                </div>
              </div>
              <InboxProcessDialog
                item={{
                  id: item.id,
                  content: item.content,
                }}
                areasWithContainers={areasWithContainers}
                projectOptions={projectOptions}
                databaseReady={databaseReady}
                aiEnabled={aiEnabled}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
