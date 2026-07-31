import { cn } from "@/lib/utils"

type PageShellProps = {
  title: string
  description: string
  eyebrow?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

export function PageShell({
  title,
  description,
  eyebrow,
  children,
  className,
  actions,
}: PageShellProps) {
  return (
    <section className={cn("space-y-7 md:space-y-8", className)}>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="space-y-2.5">
          {eyebrow ? (
            <p className="eyebrow">{eyebrow}</p>
          ) : null}
          <div className="space-y-2">
            <h2 className="max-w-4xl text-balance text-[2rem] font-semibold tracking-[-0.05em] text-white md:text-[2.5rem] md:leading-[1.02]">
              {title}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-[0.98rem]">
              {description}
            </p>
          </div>
        </div>
        {actions ? <div className="md:justify-self-end">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}
