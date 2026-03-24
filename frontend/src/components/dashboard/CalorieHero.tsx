interface Props {
  calories: number
  target: number
}

export default function CalorieHero({ calories, target }: Props) {
  const rawPct = Math.round((calories / target) * 100)
  const isOver = rawPct > 100
  const fillPct = Math.min(rawPct, 100)

  return (
    <div className="md:col-span-8 bg-surface-container p-8 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[320px]">
      <div className={`absolute top-0 right-0 w-64 h-64 ${isOver ? 'bg-error/5' : 'bg-primary/5'} rounded-full -mr-20 -mt-20 blur-3xl`} />
      <div>
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-on-surface-variant">
          Daily Energy Equilibrium
        </span>
        <div className="mt-4 flex items-baseline gap-4">
          <h2 className={`text-6xl md:text-8xl font-black tracking-tighter ${isOver ? 'text-error' : 'text-primary'}`}>
            {calories.toLocaleString()}
          </h2>
          <span className="text-2xl font-light text-on-surface-variant">
            / {target.toLocaleString()} kcal
          </span>
        </div>
        {isOver && (
          <p className="mt-2 text-sm font-bold text-error">
            +{(calories - target).toLocaleString()} kcal over target
          </p>
        )}
      </div>
      <div className="flex items-center gap-4 mt-8">
        <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-error glow-primary' : 'bg-primary glow-primary'}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <span className={`text-xs font-bold ${isOver ? 'text-error' : 'text-primary'}`}>
          {rawPct}%{isOver ? ' — over' : ''}
        </span>
      </div>
    </div>
  )
}
