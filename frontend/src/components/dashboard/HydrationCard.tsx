interface Props {
  current_ml: number
  target_ml: number
  onLog: () => void
}

export default function HydrationCard({ current_ml, target_ml, onLog }: Props) {
  return (
    <div className="bg-surface-container-low p-6 rounded-xl flex items-center gap-6">
      <div className="flex-shrink-0 w-20 h-20 bg-surface-container rounded-full flex items-center justify-center border border-outline-variant">
        <span className="material-symbols-outlined text-tertiary text-4xl">water_drop</span>
      </div>
      <div>
        <h4 className="font-bold text-on-surface mb-1">Hydration Efficiency</h4>
        <p className="text-sm text-on-surface-variant mb-3">
          Target: {(target_ml / 1000).toFixed(1)}L / Current: {(current_ml / 1000).toFixed(1)}L
        </p>
        <button
          onClick={onLog}
          className="text-[10px] font-bold uppercase tracking-widest text-secondary border border-secondary/30 px-4 py-1.5 rounded-full hover:bg-secondary/10 transition-colors"
        >
          Log Intake +500ml
        </button>
      </div>
    </div>
  )
}
