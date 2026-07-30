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
    <section className={cn("space-y-7", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/90">
              {eyebrow}
            </p>
          ) : null}
          <div className="space-y-2">
            <h2 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-white md:text-4xl">
              {title}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              {description}
            </p>
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}
