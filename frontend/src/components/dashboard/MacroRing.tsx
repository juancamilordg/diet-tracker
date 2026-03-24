const colorMap = {
  primary: { stroke: '#caff6f', text: 'text-primary' },
  secondary: { stroke: '#00e3fd', text: 'text-secondary' },
  tertiary: { stroke: '#a68cff', text: 'text-tertiary' },
}

const overColor = { stroke: '#ff7351', text: 'text-error' }

interface Props {
  label: string
  current: number
  target: number
  unit?: string
  color: 'primary' | 'secondary' | 'tertiary'
}

export default function MacroRing({ label, current, target, unit = 'g', color }: Props) {
  const rawPct = Math.round((current / target) * 100)
  const isOver = rawPct > 100
  const fillPct = Math.min(rawPct, 100)
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (fillPct / 100) * circ
  const c = isOver ? overColor : colorMap[color]

  return (
    <div className={`bg-surface-container p-6 rounded-xl flex items-center justify-between ${isOver ? 'border border-error/20' : ''}`}>
      <div>
        <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-on-surface-variant">{label}</span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className={`text-3xl font-bold ${isOver ? 'text-error' : 'text-on-surface'}`}>{Math.round(current)}</span>
          <span className="text-sm text-on-surface-variant">/ {target}{unit}</span>
        </div>
        {isOver && (
          <span className="text-[10px] font-bold text-error uppercase tracking-wider">+{rawPct - 100}% over</span>
        )}
      </div>
      <div className="relative w-16 h-16">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="32" cy="32" r={r} fill="transparent" stroke="var(--color-surface-container-highest, #192540)" strokeWidth="4" />
          <circle
            cx="32" cy="32" r={r} fill="transparent"
            stroke={c.stroke} strokeWidth="4"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${c.text}`}>
          {rawPct}%
        </div>
      </div>
    </div>
  )
}
