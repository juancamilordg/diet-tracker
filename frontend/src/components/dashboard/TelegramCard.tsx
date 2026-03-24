interface Props {
  meal: {
    description: string
    logged_at: string
    protein_g: number
    fat_g: number
    carbs_g: number
    photo_file_id?: string | null
    photo_url?: string | null
  } | null
}

export default function TelegramCard({ meal }: Props) {
  const time = meal ? new Date(meal.logged_at.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'

  const photoSrc = meal?.photo_file_id
    ? `/api/photos/${meal.photo_file_id}`
    : meal?.photo_url || null

  return (
    <div className="md:col-span-4 bg-surface-container-low p-6 rounded-xl flex flex-col justify-between border-l-2 border-primary-container/20">
      <div className="flex justify-between items-start">
        <div className="bg-[#229ED9]/10 p-2 rounded-lg text-[#229ED9]">
          <span className="material-symbols-outlined">chat</span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Sync: Telegram</span>
      </div>
      <div className="mt-4">
        <p className="text-xs text-on-surface-variant mb-1">Last Logged ({time})</p>
        <h3 className="text-xl font-bold text-on-surface leading-tight">
          {meal?.description || 'No meals logged yet'}
        </h3>
      </div>
      {photoSrc && (
        <div className="mt-4 rounded-lg overflow-hidden">
          <img
            src={photoSrc}
            alt={meal?.description || 'Meal photo'}
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}
      {meal && (
        <div className="mt-4 flex gap-4">
          <div className="text-center">
            <span className="block text-lg font-bold text-primary">{meal.protein_g}g</span>
            <span className="text-[9px] uppercase tracking-tighter text-on-surface-variant">Protein</span>
          </div>
          <div className="text-center">
            <span className="block text-lg font-bold text-secondary">{meal.fat_g}g</span>
            <span className="text-[9px] uppercase tracking-tighter text-on-surface-variant">Fats</span>
          </div>
          <div className="text-center">
            <span className="block text-lg font-bold text-tertiary">{meal.carbs_g}g</span>
            <span className="text-[9px] uppercase tracking-tighter text-on-surface-variant">Carbs</span>
          </div>
        </div>
      )}
    </div>
  )
}
