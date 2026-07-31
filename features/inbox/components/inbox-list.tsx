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
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="eyebrow">Inbox activo</p>
          <p className="text-base font-medium text-white">Por decidir</p>
          <p className="text-sm leading-7 text-muted-foreground">
            Lo más reciente aparece primero.
          </p>
        </div>
        <div className="chip-subtle px-3 py-1 text-[11px]">
          {items.length} capturas
        </div>
      </div>

      <div className="mt-6 divide-y divide-white/[0.06]">
        {items.map((item) => (
          <article
            key={item.id}
            className="py-5 first:pt-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-5">
              <p className="max-w-2xl text-sm leading-7 text-white">{item.content}</p>
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
            <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/75">
              Capturado {formatCapturedAt(item.capturedAt)}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
