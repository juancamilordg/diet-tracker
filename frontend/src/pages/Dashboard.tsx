import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import CalorieHero from '../components/dashboard/CalorieHero'
import TelegramCard from '../components/dashboard/TelegramCard'
import MacroSection from '../components/dashboard/MacroSection'
import WeeklyChart from '../components/dashboard/WeeklyChart'
import MicronutrientBars from '../components/dashboard/MicronutrientBars'
import CalendarPicker from '../components/dashboard/CalendarPicker'

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0]
}

function formatDisplayDate(dateStr: string | null) {
  if (!dateStr) return 'Today'
  const today = toDateStr(new Date())
  if (dateStr === today) return 'Today'
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === toDateStr(yesterday)) return 'Yesterday'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null) // null = today

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const dashboard = await api.getDashboard(selectedDate || undefined)
      setData(dashboard)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => { fetchData() }, [fetchData])

  const goBack = () => {
    const base = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date()
    base.setDate(base.getDate() - 1)
    setSelectedDate(toDateStr(base))
  }

  const goForward = () => {
    const base = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date()
    base.setDate(base.getDate() + 1)
    const tomorrow = toDateStr(base)
    const today = toDateStr(new Date())
    setSelectedDate(tomorrow > today ? null : tomorrow === today ? null : tomorrow)
  }

  const goToday = () => setSelectedDate(null)

  const isToday = !selectedDate || selectedDate === toDateStr(new Date())
  const todayStr = toDateStr(new Date())

  const onCalendarSelect = (date: string) => {
    setSelectedDate(date >= todayStr ? null : date)
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-on-surface-variant text-sm uppercase tracking-widest">Loading...</div>
      </div>
    )
  }

  const summary = data?.today_summary || {}
  const goals = data?.goals || {}
  const lastMeal = data?.last_meal || null
  const weekly = data?.weekly_data || []

  return (
    <div className="space-y-10">
      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goBack}
          className="text-on-surface-variant hover:text-on-surface p-2 rounded-lg transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <button
          onClick={goToday}
          className={`text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors ${
            isToday ? 'text-primary' : 'text-on-surface hover:text-primary'
          }`}
        >
          {formatDisplayDate(selectedDate)}
        </button>
        <button
          onClick={goForward}
          disabled={isToday}
          className={`p-2 rounded-lg transition-colors active:scale-90 ${
            isToday ? 'text-outline-variant cursor-not-allowed' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
        <CalendarPicker
          selected={selectedDate || todayStr}
          maxDate={todayStr}
          onSelect={onCalendarSelect}
        />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <CalorieHero
          calories={summary.total_calories || 0}
          target={goals.daily_calories_target || 2400}
        />
        <TelegramCard meal={lastMeal} />
      </section>

      <MacroSection
        protein={{ current: summary.total_protein_g || 0, target: goals.protein_target_g || 180 }}
        carbs={{ current: summary.total_carbs_g || 0, target: goals.carbs_target_g || 250 }}
        fat={{ current: summary.total_fat_g || 0, target: goals.fat_target_g || 75 }}
      />

      <WeeklyChart data={weekly} target={goals.daily_calories_target || 2400} />

      <MicronutrientBars
        fiber={{ current: summary.total_fiber_g || 0, target: goals.fiber_target_g || 30 }}
        sodium={{ current: summary.total_sodium_mg || 0 }}
      />
    </div>
  )
}
