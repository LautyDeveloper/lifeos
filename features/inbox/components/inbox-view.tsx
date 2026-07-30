import { db } from "@/db"
import { PageShell } from "@/components/shared/page-shell"
import { InboxForm } from "@/features/inbox/components/inbox-form"
import { InboxList } from "@/features/inbox/components/inbox-list"
import {
  listActiveInboxItems,
  listAreasWithContainers,
  listProjectOptions,
} from "@/features/inbox/repository"

export async function InboxView() {
  const [items, areasWithContainers, projectOptions] = await Promise.all([
    listActiveInboxItems(),
    listAreasWithContainers(),
    listProjectOptions(),
  ])

  return (
    <PageShell
      eyebrow="Capturas"
      title="Capturá ahora. Decidí después."
      description="Un espacio liviano para sacar ideas de la cabeza sin cortar el ritmo."
    >
      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-4">
          <InboxForm databaseReady={Boolean(db)} />

          <p className="px-2 text-sm leading-6 text-muted-foreground">
            Lo nuevo queda acá hasta que decidas si es una tarea, un proyecto o una nota.
          </p>
        </div>

        <InboxList
          items={items}
          areasWithContainers={areasWithContainers}
          projectOptions={projectOptions}
          databaseReady={Boolean(db)}
        />
      </div>
    </PageShell>
  )
}
