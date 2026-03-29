import { useState, useEffect, useRef } from 'react'
import { api } from '../api/client'
import TDEECard from '../components/settings/TDEECard'
import TDEECalculator from '../components/settings/TDEECalculator'
import MacroSliders from '../components/settings/MacroSliders'
import TelegramStatus from '../components/settings/TelegramStatus'

// Common IANA timezones for manual selection
const COMMON_TIMEZONES = [
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome',
  'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Zurich', 'Europe/Stockholm',
  'Europe/Warsaw', 'Europe/Athens', 'Europe/Helsinki', 'Europe/Lisbon',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Vancouver', 'America/Mexico_City', 'America/Sao_Paulo',
  'America/Buenos_Aires', 'America/Bogota', 'America/Lima',
  'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Jakarta',
  'Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Perth',
  'Pacific/Auckland', 'Pacific/Honolulu',
  'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos',
  'UTC',
]

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('darkMode')
    return stored === null ? true : stored === 'true'
  })

  useEffect(() => {
    localStorage.setItem('darkMode', String(dark))
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  return [dark, setDark] as const
}

export default function Settings() {
  const [goals, setGoals] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dark, setDark] = useDarkMode()
  const [tdeeOpen, setTdeeOpen] = useState(false)
  const calorieInputRef = useRef<HTMLInputElement>(null)
  const [userTimezone, setUserTimezone] = useState<string>('')
  const [tzSearch, setTzSearch] = useState('')
  const [tzSaving, setTzSaving] = useState(false)
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone

  const fetchGoals = async () => {
    try {
      const [data, me] = await Promise.all([api.getGoals(), api.getMe()])
      setGoals(data)
      setUserTimezone(me.timezone || 'Europe/London')
    } catch (err) {
      console.error('Failed to load goals:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGoals() }, [])

  const handleTimezoneUpdate = async (tz: string) => {
    setTzSaving(true)
    try {
      const updated = await api.updateTimezone(tz)
      setUserTimezone(updated.timezone)
      setTzSearch('')
    } catch (err) {
      console.error('Failed to update timezone:', err)
    } finally {
      setTzSaving(false)
    }
  }

  const handleUpdate = async (data: any) => {
    try {
      const updated = await api.updateGoals(data)
      setGoals(updated)
    } catch (err) {
      console.error('Failed to update goals:', err)
    }
  }

  const handleAdjustManually = () => {
    calorieInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => calorieInputRef.current?.focus(), 400)
  }

  const handleTDEESave = (data: any) => {
    handleUpdate(data)
  }

  if (loading || !goals) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-on-surface-variant text-sm uppercase tracking-widest">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-2 block">
              System Configuration
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-on-surface">User Performance</h2>
          </div>
          <div className="bg-surface-container-high px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-on-surface-variant">Active</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <TDEECard
          tdee={goals.daily_calories_target || 2400}
          onRecalculate={() => setTdeeOpen(true)}
          onAdjustManually={handleAdjustManually}
        />

        {/* Lab Visual Mode */}
        <div className="md:col-span-4 bg-surface-container-low p-8 rounded-xl flex flex-col justify-between border border-outline-variant/10">
          <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-on-surface-variant">Interface</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-on-surface">Lab Visual Mode</span>
              <div className="flex bg-surface-container p-1 rounded-lg">
                <button
                  onClick={() => setDark(false)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors ${
                    !dark ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">light_mode</span>
                  Light
                </button>
                <button
                  onClick={() => setDark(true)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors ${
                    dark ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">dark_mode</span>
                  Dark
                </button>
              </div>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-relaxed uppercase tracking-wider">
              High-contrast lab interface optimized for low-light environments.
            </p>
          </div>
        </div>

        <MacroSliders goals={goals} onUpdate={handleUpdate} />

        <TelegramStatus />

        {/* Timezone */}
        <div className="md:col-span-4 bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
          <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-6">Timezone</h3>
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">Current</span>
              <p className="text-sm font-bold text-on-surface mt-1">{userTimezone}</p>
            </div>
            {browserTz !== userTimezone && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">Browser detected</span>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-on-surface-variant">{browserTz}</p>
                  <button
                    onClick={() => handleTimezoneUpdate(browserTz)}
                    disabled={tzSaving}
                    className="text-xs font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity disabled:opacity-40"
                  >
                    Use this
                  </button>
                </div>
              </div>
            )}
            <div>
              <input
                type="text"
                placeholder="Search timezone..."
                value={tzSearch}
                onChange={e => setTzSearch(e.target.value)}
                className="w-full bg-surface-container border-none rounded-lg px-3 py-2 text-xs text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary-container"
              />
              {tzSearch && (
                <div className="mt-1 max-h-36 overflow-y-auto rounded-lg bg-surface-container border border-outline-variant/20">
                  {COMMON_TIMEZONES.filter(tz => tz.toLowerCase().includes(tzSearch.toLowerCase())).map(tz => (
                    <button
                      key={tz}
                      onClick={() => handleTimezoneUpdate(tz)}
                      disabled={tzSaving}
                      className="w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40"
                    >
                      {tz}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calorie Target */}
        <div className="md:col-span-5 bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
          <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-on-surface-variant mb-6">
            Calorie Target
          </h3>
          <div className="flex items-baseline gap-2 mb-4">
            <input
              ref={calorieInputRef}
              type="number"
              value={goals.daily_calories_target}
              onChange={e => setGoals((g: any) => ({ ...g, daily_calories_target: Number(e.target.value) || 0 }))}
              className="w-32 bg-transparent border-none text-4xl font-light text-on-surface focus:ring-0 p-0"
            />
            <span className="text-sm text-on-surface-variant uppercase tracking-widest">kcal</span>
          </div>
          <button
            onClick={() => handleUpdate({ daily_calories_target: goals.daily_calories_target })}
            className="text-xs font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
          >
            Update Target
          </button>
        </div>
      </div>

      <TDEECalculator
        open={tdeeOpen}
        onClose={() => setTdeeOpen(false)}
        onSave={handleTDEESave}
        initial={{
          weight_kg: goals.weight_kg,
          height_cm: goals.height_cm,
          age: goals.age,
          sex: goals.sex,
          activity_level: goals.activity_level,
        }}
      />
    </div>
  )
}
