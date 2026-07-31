export default function AppLoading() {
  return (
    <div className="animate-pulse space-y-7" aria-label="Cargando contenido" role="status">
      <div className="space-y-3">
        <div className="h-3 w-24 rounded bg-white/[0.06]" />
        <div className="h-10 w-full max-w-lg rounded-xl bg-white/[0.07]" />
        <div className="h-4 w-full max-w-xl rounded bg-white/[0.05]" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="h-80 rounded-2xl border border-white/6 bg-white/[0.03]" />
        <div className="h-56 rounded-2xl border border-white/6 bg-white/[0.03]" />
      </div>
    </div>
  )
}
