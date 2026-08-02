export default function AppLoading() {
  return (
    <div className="space-y-6 animate-pulse motion-reduce:animate-none">
      <div className="space-y-3">
        <div className="h-5 w-24 rounded-full bg-white/[0.05]" />
        <div className="h-9 w-80 max-w-full rounded-2xl bg-white/[0.06]" />
        <div className="h-5 w-[32rem] max-w-full rounded-full bg-white/[0.04]" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="surface-1 rounded-[30px] border p-6">
          <div className="space-y-4">
            <div className="h-5 w-24 rounded-full bg-white/[0.05]" />
            <div className="h-8 w-64 rounded-2xl bg-white/[0.06]" />
            <div className="h-28 rounded-[24px] bg-white/[0.04]" />
            <div className="h-11 w-40 rounded-[18px] bg-white/[0.05]" />
          </div>
        </div>

        <div className="surface-1 rounded-[30px] border p-6">
          <div className="space-y-4">
            <div className="h-5 w-28 rounded-full bg-white/[0.05]" />
            <div className="h-20 rounded-[22px] bg-white/[0.04]" />
            <div className="h-20 rounded-[22px] bg-white/[0.04]" />
            <div className="h-20 rounded-[22px] bg-white/[0.04]" />
          </div>
        </div>
      </div>
    </div>
  )
}
