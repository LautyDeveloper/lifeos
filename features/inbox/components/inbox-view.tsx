import { db } from "@/db"
import { PageShell } from "@/components/shared/page-shell"
import { InboxForm } from "@/features/inbox/components/inbox-form"
import { InboxList } from "@/features/inbox/components/inbox-list"
import { listInboxItems } from "@/features/inbox/repository"

export async function InboxView() {
  const items = await listInboxItems()

  return (
    <PageShell
      eyebrow="Inbox"
      title="Capturar ahora. Organizar después."
      description="Esta pantalla es solo para vaciar la mente con velocidad. Nada de clasificar, nada de decidir dos veces."
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
        <div className="space-y-4">
          <InboxForm databaseReady={Boolean(db)} />

          <section className="surface-1 rounded-[32px] border p-5 md:p-6">
            <p className="text-sm font-medium text-white">Regla del sistema</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Si aparece una idea, la capturás. Si necesita estructura, la procesás después.
              Inbox no es un lugar para ordenar; es un buffer para seguir avanzando.
            </p>
          </section>
        </div>

        <InboxList items={items} />
      </div>
    </PageShell>
  )
}
