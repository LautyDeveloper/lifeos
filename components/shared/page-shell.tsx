import { cn } from "@/lib/utils"

type PageShellProps = {
  title: string
  description: string
  eyebrow?: string
  children: React.ReactNode
  className?: string
}

export function PageShell({
  title,
  description,
  eyebrow,
  children,
  className,
}: PageShellProps) {
  return (
    <section className={cn("space-y-8", className)}>
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.28em] text-primary/90">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  )
}
