import { useState, useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: {
    daily_calories_target: number
    protein_target_g: number
    carbs_target_g: number
    fat_target_g: number
    weight_kg: number
    height_cm: number
    age: number
    sex: string
    activity_level: string
  }) => void
  initial?: {
    weight_kg?: number | null
    height_cm?: number | null
    age?: number | null
    sex?: string | null
    activity_level?: string | null
  }
}

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', factor: 1.2 },
  { value: 'light', label: 'Light', desc: 'Exercise 1-3 days/week', factor: 1.375 },
  { value: 'moderate', label: 'Moderate', desc: 'Exercise 3-5 days/week', factor: 1.55 },
  { value: 'active', label: 'Active', desc: 'Exercise 6-7 days/week', factor: 1.725 },
  { value: 'very_active', label: 'Very Active', desc: 'Hard exercise + physical job', factor: 1.9 },
]

const FITNESS_GOALS = [
  {
    value: 'lose',
    label: 'Lose Fat',
    icon: 'trending_down',
    desc: '20% deficit, preserve muscle',
    calorieMultiplier: 0.80,
    proteinPct: 0.30,
    carbsPct: 0.35,
    fatPct: 0.35,
  },
  {
    value: 'maintain',
    label: 'Maintain',
    icon: 'balance',
    desc: 'Stay at current weight',
    calorieMultiplier: 1.0,
    proteinPct: 0.25,
    carbsPct: 0.45,
    fatPct: 0.30,
  },
  {
    value: 'lean_bulk',
    label: 'Lean Bulk',
    icon: 'fitness_center',
    desc: '10% surplus, muscle focus',
    calorieMultiplier: 1.10,
    proteinPct: 0.30,
    carbsPct: 0.40,
    fatPct: 0.30,
  },
  {
    value: 'bulk',
    label: 'Bulk',
    icon: 'trending_up',
    desc: '20% surplus, maximum growth',
    calorieMultiplier: 1.20,
    proteinPct: 0.25,
    carbsPct: 0.45,
    fatPct: 0.30,
  },
]

function calculateTDEE(weight: number, height: number, age: number, sex: string, activityLevel: string): number {
  let bmr: number
  if (sex === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161
  }
  const activity = ACTIVITY_LEVELS.find(a => a.value === activityLevel)
  return Math.round(bmr * (activity?.factor ?? 1.55))
}

function calculateMacros(targetCalories: number, goal: typeof FITNESS_GOALS[number]) {
  const proteinG = Math.round((targetCalories * goal.proteinPct) / 4)
  const carbsG = Math.round((targetCalories * goal.carbsPct) / 4)
  const fatG = Math.round((targetCalories * goal.fatPct) / 9)
  return { proteinG, carbsG, fatG }
}

export default function TDEECalculator({ open, onClose, onSave, initial }: Props) {
  const [weight, setWeight] = useState(initial?.weight_kg || 70)
  const [height, setHeight] = useState(initial?.height_cm || 170)
  const [age, setAge] = useState(initial?.age || 30)
  const [sex, setSex] = useState(initial?.sex || 'male')
  const [activity, setActivity] = useState(initial?.activity_level || 'moderate')
  const [goalKey, setGoalKey] = useState('maintain')

  useEffect(() => {
    if (initial?.weight_kg) setWeight(initial.weight_kg)
    if (initial?.height_cm) setHeight(initial.height_cm)
    if (initial?.age) setAge(initial.age)
    if (initial?.sex) setSex(initial.sex)
    if (initial?.activity_level) setActivity(initial.activity_level)
  }, [initial])

  if (!open) return null

  const tdee = calculateTDEE(weight, height, age, sex, activity)
  const goal = FITNESS_GOALS.find(g => g.value === goalKey)!
  const targetCalories = Math.round(tdee * goal.calorieMultiplier)
  const macros = calculateMacros(targetCalories, goal)

  const proteinPct = Math.round(goal.proteinPct * 100)
  const carbsPct = Math.round(goal.carbsPct * 100)
  const fatPct = Math.round(goal.fatPct * 100)

  const handleSave = () => {
    onSave({
      daily_calories_target: targetCalories,
      protein_target_g: macros.proteinG,
      carbs_target_g: macros.carbsG,
      fat_target_g: macros.fatG,
      weight_kg: weight,
      height_cm: height,
      age,
      sex,
      activity_level: activity,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container-low rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-outline-variant/10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-bold text-on-surface tracking-tight">TDEE Calculator</h2>
            <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-wider">Mifflin-St Jeor Equation</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Sex */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Sex</label>
            <div className="flex bg-surface-container rounded-lg p-1 gap-1">
              <button
                onClick={() => setSex('male')}
                className={`flex-1 py-2.5 rounded-md text-sm font-bold transition-colors ${
                  sex === 'male' ? 'bg-primary text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setSex('female')}
                className={`flex-1 py-2.5 rounded-md text-sm font-bold transition-colors ${
                  sex === 'female' ? 'bg-primary text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Age</label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(Number(e.target.value) || 0)}
              min={10}
              max={120}
              className="w-full bg-surface-container-high border-none rounded-lg text-on-surface text-lg font-medium py-3 px-4 focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Weight & Height */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(Number(e.target.value) || 0)}
                step={0.5}
                min={20}
                max={300}
                className="w-full bg-surface-container-high border-none rounded-lg text-on-surface text-lg font-medium py-3 px-4 focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={e => setHeight(Number(e.target.value) || 0)}
                min={100}
                max={250}
                className="w-full bg-surface-container-high border-none rounded-lg text-on-surface text-lg font-medium py-3 px-4 focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Activity Level</label>
            <div className="space-y-2">
              {ACTIVITY_LEVELS.map(level => (
                <button
                  key={level.value}
                  onClick={() => setActivity(level.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex justify-between items-center ${
                    activity === level.value
                      ? 'bg-primary/15 border border-primary/30'
                      : 'bg-surface-container hover:bg-surface-container-high border border-transparent'
                  }`}
                >
                  <div>
                    <span className={`text-sm font-bold ${activity === level.value ? 'text-primary' : 'text-on-surface'}`}>
                      {level.label}
                    </span>
                    <p className="text-xs text-on-surface-variant">{level.desc}</p>
                  </div>
                  {activity === level.value && (
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Fitness Goal */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-3">Fitness Goal</label>
            <div className="grid grid-cols-2 gap-2">
              {FITNESS_GOALS.map(g => (
                <button
                  key={g.value}
                  onClick={() => setGoalKey(g.value)}
                  className={`text-left px-4 py-3 rounded-lg transition-colors ${
                    goalKey === g.value
                      ? 'bg-primary/15 border border-primary/30'
                      : 'bg-surface-container hover:bg-surface-container-high border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`material-symbols-outlined text-lg ${goalKey === g.value ? 'text-primary' : 'text-on-surface-variant'}`}>{g.icon}</span>
                    <span className={`text-sm font-bold ${goalKey === g.value ? 'text-primary' : 'text-on-surface'}`}>{g.label}</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant leading-tight">{g.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          <div className="bg-surface-container rounded-xl p-6 border-l-4 border-primary space-y-4">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Maintenance TDEE</p>
              <span className="text-2xl font-light tracking-tighter text-on-surface-variant">{tdee.toLocaleString()} kcal</span>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Daily Target</p>
              <span className="text-5xl font-light tracking-tighter text-on-surface">{targetCalories.toLocaleString()}</span>
              <span className="text-lg text-primary font-bold ml-2">kcal</span>
              {goal.calorieMultiplier !== 1 && (
                <p className="text-xs text-on-surface-variant mt-1">
                  {goal.calorieMultiplier < 1
                    ? `${Math.round((1 - goal.calorieMultiplier) * 100)}% deficit`
                    : `${Math.round((goal.calorieMultiplier - 1) * 100)}% surplus`
                  }
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Protein</p>
                <p className="text-lg font-bold text-on-surface">{macros.proteinG}g</p>
                <p className="text-[10px] text-primary font-bold">{proteinPct}%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Carbs</p>
                <p className="text-lg font-bold text-on-surface">{macros.carbsG}g</p>
                <p className="text-[10px] text-on-surface-variant font-bold">{carbsPct}%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Fat</p>
                <p className="text-lg font-bold text-on-surface">{macros.fatG}g</p>
                <p className="text-[10px] text-on-surface-variant font-bold">{fatPct}%</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg text-sm font-bold text-on-surface bg-surface-container-highest hover:bg-surface-dim transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-lg text-sm font-bold kinetic-gradient text-on-primary-container hover:opacity-90 transition-opacity"
            >
              Apply All Targets
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
