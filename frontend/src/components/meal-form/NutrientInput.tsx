interface Props {
  label: string
  value: number
  unit: string
  colorClass: string
  onChange: (v: number) => void
}

export default function NutrientInput({ label, value, unit, colorClass, onChange }: Props) {
  return (
    <div className="bg-surface-container-low p-5 rounded-xl flex flex-col items-center justify-center space-y-1">
      <label className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">{label}</label>
      <input
        type="number"
        value={value || ''}
        onChange={e => onChange(Number(e.target.value) || 0)}
        className={`w-full bg-transparent border-none text-center text-3xl font-light ${colorClass} focus:ring-0 p-0`}
      />
      <span className="text-[10px] text-outline font-medium">{unit}</span>
    </div>
  )
}
