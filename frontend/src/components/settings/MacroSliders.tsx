import { useState, useEffect } from 'react'

interface Props {
  goals: {
    daily_calories_target: number
    protein_target_g: number
    carbs_target_g: number
    fat_target_g: number
  }
  onUpdate: (data: any) => void
}

export default function MacroSliders({ goals, onUpdate }: Props) {
  const [values, setValues] = useState(goals)

  useEffect(() => { setValues(goals) }, [goals])

  const totalCals = (values.protein_target_g * 4) + (values.carbs_target_g * 4) + (values.fat_target_g * 9)
  const proteinPct = totalCals > 0 ? Math.round((values.protein_target_g * 4 / totalCals) * 100) : 0
  const carbsPct = totalCals > 0 ? Math.round((values.carbs_target_g * 4 / totalCals) * 100) : 0
  const fatPct = totalCals > 0 ? Math.round((values.fat_target_g * 9 / totalCals) * 100) : 0

  const handleSave = () => onUpdate(values)

  return (
    <div className="md:col-span-12 bg-surface-container p-8 rounded-xl">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-on-surface-variant">
          Macro Ratio Configuration
        </h3>
        <button
          onClick={handleSave}
          className="text-xs font-bold text-primary tracking-widest uppercase hover:text-primary-dim transition-colors"
        >
          Save Changes
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Protein */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold tracking-widest uppercase">Protein</span>
            <div className="flex items-baseline">
              <input
                type="number"
                value={values.protein_target_g}
                onChange={e => setValues(v => ({ ...v, protein_target_g: Number(e.target.value) || 0 }))}
                className="w-16 bg-transparent border-none text-right text-2xl font-light text-primary focus:ring-0 p-0"
              />
              <small className="text-[10px] ml-1 uppercase text-on-surface-variant">g</small>
            </div>
          </div>
          <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${proteinPct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">
            <span>Target</span>
            <span>{proteinPct}%</span>
          </div>
        </div>

        {/* Carbs */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold tracking-widest uppercase">Carbs</span>
            <div className="flex items-baseline">
              <input
                type="number"
                value={values.carbs_target_g}
                onChange={e => setValues(v => ({ ...v, carbs_target_g: Number(e.target.value) || 0 }))}
                className="w-16 bg-transparent border-none text-right text-2xl font-light text-on-surface focus:ring-0 p-0"
              />
              <small className="text-[10px] ml-1 uppercase text-on-surface-variant">g</small>
            </div>
          </div>
          <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-on-surface-variant transition-all" style={{ width: `${carbsPct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">
            <span>Target</span>
            <span>{carbsPct}%</span>
          </div>
        </div>

        {/* Fats */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold tracking-widest uppercase">Fats</span>
            <div className="flex items-baseline">
              <input
                type="number"
                value={values.fat_target_g}
                onChange={e => setValues(v => ({ ...v, fat_target_g: Number(e.target.value) || 0 }))}
                className="w-16 bg-transparent border-none text-right text-2xl font-light text-secondary focus:ring-0 p-0"
              />
              <small className="text-[10px] ml-1 uppercase text-on-surface-variant">g</small>
            </div>
          </div>
          <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-secondary transition-all" style={{ width: `${fatPct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">
            <span>Target</span>
            <span>{fatPct}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
