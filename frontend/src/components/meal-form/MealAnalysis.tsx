import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api/client'
import NutrientInput from './NutrientInput'
import PhotoUpload from './PhotoUpload'

export default function MealAnalysis() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    description: '',
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    sodium_mg: 0,
    meal_category: 'lunch' as string,
    notes: '',
  })
  const [photoUrl, setPhotoUrl] = useState<string | undefined>()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [existingPhoto, setExistingPhoto] = useState<{ photo_file_id?: string; photo_url?: string }>({})
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (id) {
      api.getMeal(Number(id)).then(meal => {
        setForm({
          description: meal.description || '',
          calories: meal.calories || 0,
          protein_g: meal.protein_g || 0,
          carbs_g: meal.carbs_g || 0,
          fat_g: meal.fat_g || 0,
          fiber_g: meal.fiber_g || 0,
          sodium_mg: meal.sodium_mg || 0,
          meal_category: meal.meal_category || 'lunch',
          notes: meal.notes || '',
        })
        if (meal.photo_file_id) {
          setPhotoUrl(`/api/photos/${meal.photo_file_id}`)
          setExistingPhoto({ photo_file_id: meal.photo_file_id })
        } else if (meal.photo_url) {
          setPhotoUrl(meal.photo_url)
          setExistingPhoto({ photo_url: meal.photo_url })
        }
      })
    }
  }, [id])

  const handlePhotoChange = async (file: File) => {
    setPhotoFile(file)
    setPhotoUrl(URL.createObjectURL(file))

    // Auto-analyze photo
    setAnalyzing(true)
    try {
      const result = await api.analyzeMeal({ photo: file })
      setForm(prev => ({
        ...prev,
        description: result.meal_name || result.description || prev.description,
        calories: result.calories || prev.calories,
        protein_g: result.protein_g || prev.protein_g,
        carbs_g: result.carbs_g || prev.carbs_g,
        fat_g: result.fat_g || prev.fat_g,
        fiber_g: result.fiber_g || prev.fiber_g,
        sodium_mg: result.sodium_mg || prev.sodium_mg,
      }))
    } catch (err) {
      console.error('Analysis failed:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description) return
    setSaving(true)
    try {
      const payload: any = {
        ...form,
        input_method: photoFile ? 'photo' : 'manual',
      }
      // Upload new photo if selected
      if (photoFile) {
        const uploadedUrl = await api.uploadMealPhoto(photoFile)
        payload.photo_url = uploadedUrl
        payload.photo_file_id = null // clear telegram photo since we have a new one
      } else if (isEdit) {
        // Preserve existing photo data
        if (existingPhoto.photo_file_id) payload.photo_file_id = existingPhoto.photo_file_id
        if (existingPhoto.photo_url) payload.photo_url = existingPhoto.photo_url
      }
      if (isEdit) {
        await api.updateMeal(Number(id), payload)
      } else {
        await api.createMeal(payload)
      }
      navigate('/log')
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const fiberPct = form.fiber_g > 0 ? Math.min(Math.round((form.fiber_g / 30) * 100), 100) : 0
  const sodiumPct = form.sodium_mg > 0 ? Math.min(Math.round((form.sodium_mg / 2300) * 100), 100) : 0

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="text-xs tracking-[0.2em] text-primary uppercase font-bold">
          {isEdit ? 'Refine Entry' : 'New Entry'}
        </span>
        <h2 className="text-4xl font-extrabold tracking-tighter mt-2 text-on-surface">Meal Analysis</h2>
        <p className="text-on-surface-variant text-sm mt-2 max-w-xs mx-auto">
          {analyzing ? 'Analyzing meal with AI...' : 'Review and calibrate nutritional data for laboratory precision.'}
        </p>
      </div>

      <PhotoUpload photoUrl={photoUrl} onPhotoChange={handlePhotoChange} />

      <form onSubmit={handleSave} className="space-y-8">
        {/* Meal Name */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant ml-1 font-semibold">
            Identification
          </label>
          <input
            type="text"
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter meal name..."
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary-container focus:bg-surface-bright transition-all"
          />
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NutrientInput label="Energy" value={form.calories} unit="kcal" colorClass="text-primary" onChange={v => setForm(p => ({ ...p, calories: v }))} />
          <NutrientInput label="Protein" value={form.protein_g} unit="grams" colorClass="text-secondary" onChange={v => setForm(p => ({ ...p, protein_g: v }))} />
          <NutrientInput label="Carbs" value={form.carbs_g} unit="grams" colorClass="text-tertiary" onChange={v => setForm(p => ({ ...p, carbs_g: v }))} />
          <NutrientInput label="Lipids" value={form.fat_g} unit="grams" colorClass="text-error" onChange={v => setForm(p => ({ ...p, fat_g: v }))} />
        </div>

        {/* Micro-Nutrients */}
        <div className="bg-surface-container p-6 rounded-xl space-y-6">
          <h3 className="text-[10px] uppercase tracking-widest text-on-surface-variant font-black">
            Micro-Nutrient Calibration
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline text-lg">water_drop</span>
                <span className="text-sm font-medium">Fiber Content</span>
              </div>
              <input
                type="number"
                step="0.1"
                value={form.fiber_g || ''}
                onChange={e => setForm(p => ({ ...p, fiber_g: Number(e.target.value) || 0 }))}
                className="w-20 bg-transparent border-none text-right text-sm font-bold text-on-surface focus:ring-0 p-0"
                placeholder="0g"
              />
            </div>
            <div className="w-full bg-surface-container-highest h-1 rounded-full">
              <div className="bg-secondary h-1 rounded-full transition-all" style={{ width: `${fiberPct}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline text-lg">bolt</span>
                <span className="text-sm font-medium">Sodium Index</span>
              </div>
              <input
                type="number"
                value={form.sodium_mg || ''}
                onChange={e => setForm(p => ({ ...p, sodium_mg: Number(e.target.value) || 0 }))}
                className="w-20 bg-transparent border-none text-right text-sm font-bold text-on-surface focus:ring-0 p-0"
                placeholder="0mg"
              />
            </div>
            <div className="w-full bg-surface-container-highest h-1 rounded-full">
              <div className="bg-primary h-1 rounded-full transition-all" style={{ width: `${sodiumPct}%` }} />
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant ml-1 font-semibold">
            Meal Category
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['breakfast', 'lunch', 'dinner', 'snack'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm(p => ({ ...p, meal_category: cat }))}
                className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  form.meal_category === cat
                    ? 'kinetic-gradient text-[#182700]'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-6">
          <button
            type="submit"
            disabled={saving || !form.description}
            className="kinetic-gradient text-[#182700] font-black uppercase tracking-widest text-xs py-5 rounded-xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
            {saving ? 'Saving...' : 'Save Record'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-transparent text-on-surface-variant font-bold uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-surface-container-highest transition-all active:scale-[0.98]"
          >
            Cancel & Discard
          </button>
        </div>
      </form>
    </div>
  )
}
