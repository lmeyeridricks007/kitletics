/** Athletic product collage for the homepage hero — CSS shapes as stand-ins for real gear photography. */
export function HeroCollage() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg lg:max-w-none">
      {/* Soft glow */}
      <div className="absolute top-1/2 left-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl" />

      {/* Watch card */}
      <div className="animate-float-a absolute top-[8%] right-[6%] z-20 w-[42%] overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
        <div className="aspect-square bg-gradient-to-br from-charcoal-800 via-charcoal-700 to-charcoal-900 p-4">
          <div className="flex h-full flex-col justify-between rounded-xl border border-white/10 bg-charcoal-900/60 p-3 text-white">
            <div className="flex items-center justify-between text-[10px] text-white/50">
              <span>GPS</span>
              <span>84%</span>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-semibold tracking-tight">5:24</p>
              <p className="text-[10px] text-white/50">/km · Zone 2</p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-2/3 rounded-full bg-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Shoe card */}
      <div className="animate-float-b absolute top-[28%] left-[2%] z-10 w-[52%] overflow-hidden rounded-2xl border border-border bg-surface shadow-md">
        <div className="aspect-[4/3] bg-gradient-to-br from-accent-muted via-surface-muted to-charcoal-100 dark:from-accent-muted dark:via-charcoal-800 dark:to-charcoal-900">
          <div className="flex h-full flex-col justify-end p-4">
            <div className="rounded-xl bg-surface/90 p-3 backdrop-blur-sm">
              <p className="text-[10px] font-medium tracking-wide text-muted uppercase">
                Daily trainer
              </p>
              <p className="font-display text-sm font-semibold text-foreground">
                Kinetic Ride 2
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full w-[78%] rounded-full bg-accent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apparel / vest card */}
      <div className="animate-float-c absolute right-[10%] bottom-[6%] z-30 w-[46%] overflow-hidden rounded-2xl border border-border bg-surface shadow-md">
        <div className="aspect-[5/4] bg-gradient-to-t from-charcoal-900 via-charcoal-700 to-charcoal-500 p-4">
          <div className="flex h-full flex-col justify-between">
            <span className="self-start rounded-lg bg-white/10 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
              Race vest
            </span>
            <div className="space-y-1 text-white">
              <p className="font-display text-base font-semibold">Aero Pack 5L</p>
              <p className="text-[11px] text-white/60">Hydration · 182g</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
