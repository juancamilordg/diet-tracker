import { useState, useEffect } from 'react'
import { api } from '../api/client'
import DailyMacroHeader from '../components/feed/DailyMacroHeader'
import DateDivider from '../components/feed/DateDivider'
import MealCard from '../components/feed/MealCard'

export default function LogHistory() {
  const [meals, setMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [todayTotals, setTodayTotals] = useState({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 })

  const fetchMeals = async () => {
    try {
      const data = await api.getMeals({ limit: 100 })
      setMeals(data)

      // Calculate today's totals
      const today = new Date().toISOString().split('T')[0]
      const todayMeals = data.filter((m: any) => m.logged_at?.startsWith(today))
      setTodayTotals({
        calories: todayMeals.reduce((s: number, m: any) => s + (m.calories || 0), 0),
        protein_g: todayMeals.reduce((s: number, m: any) => s + (m.protein_g || 0), 0),
        carbs_g: todayMeals.reduce((s: number, m: any) => s + (m.carbs_g || 0), 0),
        fat_g: todayMeals.reduce((s: number, m: any) => s + (m.fat_g || 0), 0),
      })
    } catch (err) {
      console.error('Failed to load meals:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMeals() }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this meal?')) return
    try {
      await api.deleteMeal(id)
      fetchMeals()
    } catch (err) {
      console.error('Failed to delete meal:', err)
    }
  }

  // Group meals by date
  const grouped: Record<string, any[]> = {}
  meals.forEach(meal => {
    const raw = meal.logged_at || ''
    const date = raw.includes('T') ? raw.split('T')[0] : raw.split(' ')[0] || 'Unknown'
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(meal)
  })

  const today = new Date().toISOString().split('T')[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-on-surface-variant text-sm uppercase tracking-widest">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <DailyMacroHeader {...todayTotals} />
      <div className="space-y-8">
        {Object.entries(grouped).map(([date, dateMeals]) => (
          <div key={date} className="space-y-4">
            <DateDivider
              date={new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              isToday={date === today}
            />
            {dateMeals.map(meal => (
              <MealCard key={meal.id} meal={meal} onDelete={handleDelete} />
            ))}
          </div>
        ))}
        {meals.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">restaurant</span>
            <p className="text-on-surface-variant">No meals logged yet. Start by logging a meal!</p>
          </div>
        )}
      </div>
    </div>
  )
}
