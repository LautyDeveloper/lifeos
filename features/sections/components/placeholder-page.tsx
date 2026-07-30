import { Clock3 } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"

type PlaceholderPageProps = {
  eyebrow: string
  title: string
  description: string
  note?: string
}

export function PlaceholderPage({ eyebrow, title, description, note }: PlaceholderPageProps) {
  return (
    <PageShell eyebrow={eyebrow} title={title} description={description}>
      <section className="surface-1 rounded-2xl border p-8 md:p-12">
        <div className="max-w-xl">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Clock3 className="size-5" />
          </div>
          <h3 className="mt-6 text-xl font-semibold text-white">Este espacio todavía no necesita más.</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {note ?? "Cuando haya una necesidad concreta, va a crecer con la misma claridad que el resto del sistema."}
          </p>
        </div>
      </section>
    </PageShell>
  )
}
