interface Props {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export default function DailyMacroHeader({ calories, protein_g, carbs_g, fat_g }: Props) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <span className="tracking-widest uppercase text-xs font-bold text-primary">Performance Hub</span>
          <h2 className="text-3xl font-light mt-1 text-on-surface">Nutrition Log</h2>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-on-surface-variant">Today's Intake</span>
          <div className="text-2xl font-black text-primary">
            {calories.toLocaleString()} <span className="text-xs font-light text-on-surface-variant uppercase tracking-widest">kcal</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 bg-surface-container-low rounded-xl p-4">
        <div className="text-center border-r border-outline-variant/10">
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-tighter">Protein</div>
          <div className="text-xl font-bold text-primary">{Math.round(protein_g)}g</div>
        </div>
        <div className="text-center border-r border-outline-variant/10">
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-tighter">Carbs</div>
          <div className="text-xl font-bold text-secondary">{Math.round(carbs_g)}g</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-on-surface-variant uppercase tracking-tighter">Fats</div>
          <div className="text-xl font-bold text-tertiary">{Math.round(fat_g)}g</div>
        </div>
      </div>
    </div>
  )
}
