interface Props {
  tdee: number
  onRecalculate?: () => void
  onAdjustManually?: () => void
}

export default function TDEECard({ tdee, onRecalculate, onAdjustManually }: Props) {
  return (
    <div className="md:col-span-8 bg-surface-container p-8 rounded-xl relative overflow-hidden border-l-4 border-primary">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
      </div>
      <div className="relative z-10">
        <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-6">
          Total Daily Energy Expenditure
        </h3>
        <div className="flex items-baseline gap-4 mb-8">
          <span className="text-7xl font-light tracking-tighter text-on-surface">
            {tdee.toLocaleString()}
          </span>
          <span className="text-xl font-bold text-primary uppercase tracking-widest">kcal</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={onRecalculate}
            className="kinetic-gradient text-on-primary-container px-6 py-3 rounded-xl font-bold text-sm tracking-wide active:scale-95 duration-200 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Recalculate
          </button>
          <button
            onClick={onAdjustManually}
            className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-xl font-bold text-sm tracking-wide border border-outline-variant/20 hover:bg-surface-bright transition-colors"
          >
            Adjust
          </button>
        </div>
      </div>
    </div>
  )
}
