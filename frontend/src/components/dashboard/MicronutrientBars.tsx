interface Props {
  fiber: { current: number; target: number }
  sodium: { current: number }
}

export default function MicronutrientBars({ fiber, sodium }: Props) {
  const fiberRaw = Math.round((fiber.current / fiber.target) * 100)
  const fiberPct = Math.min(fiberRaw, 100)

  const sodiumLimit = 2300 // FDA recommendation
  const sodiumRaw = Math.round(sodium.current / sodiumLimit * 100)
  const sodiumPct = Math.min(sodiumRaw, 100)
  const sodiumOver = sodiumRaw > 100

  return (
    <div className="bg-surface-container-low p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-secondary">science</span>
        <h4 className="font-bold text-on-surface tracking-wide">Micronutrient Bio-Markers</h4>
      </div>
      <div className="space-y-4">
        {/* Fiber — over is fine */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-on-surface-variant">Fiber</span>
          <span className="font-bold text-on-surface">{Math.round(fiber.current)}g / {fiber.target}g ({fiberRaw}%)</span>
        </div>
        <div className="w-full h-1 bg-surface-container-highest rounded-full">
          <div className="h-full bg-secondary rounded-full transition-all duration-500" style={{ width: `${fiberPct}%` }} />
        </div>

        {/* Sodium — over is bad */}
        <div className="flex justify-between items-center text-xs mt-2">
          <span className="text-on-surface-variant">Sodium</span>
          <span className={`font-bold ${sodiumOver ? 'text-error' : 'text-on-surface'}`}>
            {Math.round(sodium.current)}mg / {sodiumLimit}mg ({sodiumRaw}%)
          </span>
        </div>
        <div className="w-full h-1 bg-surface-container-highest rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-500 ${sodiumOver ? 'bg-error' : 'bg-primary'}`}
            style={{ width: `${sodiumPct}%` }}
          />
        </div>
        {sodiumOver && (
          <span className="text-[10px] font-bold text-error uppercase tracking-wider">+{sodiumRaw - 100}% over recommended limit</span>
        )}
      </div>
    </div>
  )
}
