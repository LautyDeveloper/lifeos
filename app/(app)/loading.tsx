export default function AppLoading() {
  return (
    <div className="space-y-6 animate-pulse motion-reduce:animate-none">
      <div className="space-y-4">
        <div className="h-4 w-24 rounded-full bg-white/[0.05]" />
        <div className="h-10 w-96 max-w-full rounded-[22px] bg-white/[0.06]" />
        <div className="h-5 w-[36rem] max-w-full rounded-full bg-white/[0.04]" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="surface-1 rounded-[30px] border p-6">
          <div className="space-y-5">
            <div className="h-5 w-28 rounded-full bg-white/[0.05]" />
            <div className="h-7 w-72 rounded-2xl bg-white/[0.06]" />
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.72fr]">
              <div className="h-44 rounded-[24px] bg-white/[0.04]" />
              <div className="h-44 rounded-[24px] bg-white/[0.04]" />
              <div className="grid gap-4">
                <div className="h-20 rounded-[24px] bg-white/[0.04]" />
                <div className="h-20 rounded-[24px] bg-white/[0.04]" />
              </div>
            </div>
          </div>
        </div>

        <div className="surface-1 rounded-[30px] border p-6">
          <div className="space-y-4">
            <div className="h-5 w-32 rounded-full bg-white/[0.05]" />
            <div className="h-9 w-44 rounded-[20px] bg-white/[0.06]" />
            <div className="space-y-3">
              <div className="h-24 rounded-[24px] bg-white/[0.04]" />
              <div className="h-24 rounded-[24px] bg-white/[0.04]" />
              <div className="h-24 rounded-[24px] bg-white/[0.04]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
