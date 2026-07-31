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
    <section className={cn("space-y-8 md:space-y-10", className)}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          {eyebrow ? (
            <p className="eyebrow">
              {eyebrow}
            </p>
          ) : null}
          <div className="space-y-3">
            <h2 className="max-w-4xl text-balance text-3xl font-semibold tracking-[-0.045em] text-white md:text-[2.7rem] md:leading-[1.02]">
              {title}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-[1rem]">
              {description}
            </p>
          </div>
        </div>
        {actions ? <div className="shrink-0 pt-1">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}
