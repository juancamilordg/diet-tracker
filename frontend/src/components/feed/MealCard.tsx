import { useNavigate } from 'react-router-dom'

interface Props {
  meal: {
    id: number
    description: string
    logged_at: string
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    photo_url?: string
    photo_file_id?: string
    notes?: string
  }
  onDelete: (id: number) => void
}

export default function MealCard({ meal, onDelete }: Props) {
  const navigate = useNavigate()
  const time = new Date(meal.logged_at.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const photoSrc = meal.photo_file_id ? `/api/photos/${meal.photo_file_id}` : meal.photo_url

  return (
    <div className="group relative flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-surface-container transition-all hover:bg-surface-container-high">
      {/* Photo */}
      <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden shrink-0">
        {photoSrc ? (
          <img src={photoSrc} alt={meal.description} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-outline-variant text-4xl">restaurant</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-on-surface">{meal.description}</h3>
            <span className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded">
              {time}
            </span>
          </div>
          {meal.notes && (
            <p className="text-sm text-on-surface-variant font-light mt-1">{meal.notes}</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 items-center">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-tighter text-on-surface-variant">Energy</span>
            <span className="text-sm font-bold text-primary">{Math.round(meal.calories)} kcal</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-tighter text-on-surface-variant">P</span>
            <span className="text-sm font-bold">{Math.round(meal.protein_g)}g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-tighter text-on-surface-variant">C</span>
            <span className="text-sm font-bold">{Math.round(meal.carbs_g)}g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-tighter text-on-surface-variant">F</span>
            <span className="text-sm font-bold">{Math.round(meal.fat_g)}g</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-outline-variant/10 pt-4 md:pt-0 md:pl-4">
        <button
          onClick={() => navigate(`/edit/${meal.id}`)}
          className="flex-1 md:flex-none p-2 rounded-lg hover:bg-surface-bright text-on-surface-variant transition-colors active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-lg">edit</span>
        </button>
        <button
          onClick={() => onDelete(meal.id)}
          className="flex-1 md:flex-none p-2 rounded-lg hover:bg-error-container/20 text-error transition-colors active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </div>
  )
}
