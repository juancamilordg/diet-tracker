import { useState, useEffect, useRef } from 'react'

interface Props {
  selected: string // YYYY-MM-DD
  maxDate: string
  onSelect: (date: string) => void
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function pad(n: number) { return n.toString().padStart(2, '0') }
function toStr(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}` }

export default function CalendarPicker({ selected, maxDate, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selDate = new Date(selected + 'T12:00:00')
  const [viewYear, setViewYear] = useState(selDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(selDate.getMonth())

  // Reset view when selected changes externally
  useEffect(() => {
    const d = new Date(selected + 'T12:00:00')
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }, [selected])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    const now = new Date()
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear
    if (nextY > now.getFullYear() || (nextY === now.getFullYear() && nextM > now.getMonth())) return
    setViewMonth(nextM)
    setViewYear(nextY)
  }

  const canGoNext = () => {
    const now = new Date()
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear
    return nextY < now.getFullYear() || (nextY === now.getFullYear() && nextM <= now.getMonth())
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-on-surface-variant hover:text-on-surface p-2 rounded-lg transition-colors active:scale-90"
      >
        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-surface-container rounded-xl shadow-xl border border-outline-variant/20 p-4 w-[280px] animate-in fade-in">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="text-sm font-bold text-on-surface tracking-wide">{monthLabel}</span>
            <button
              onClick={nextMonth}
              disabled={!canGoNext()}
              className={`p-1 rounded-lg transition-colors ${canGoNext() ? 'hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface' : 'text-outline-variant cursor-not-allowed'}`}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-on-surface-variant uppercase tracking-wider py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />
              const dateStr = toStr(viewYear, viewMonth, day)
              const isDisabled = dateStr > maxDate
              const isSelected = dateStr === selected
              const isToday = dateStr === maxDate

              return (
                <button
                  key={dateStr}
                  disabled={isDisabled}
                  onClick={() => { onSelect(dateStr); setOpen(false) }}
                  className={`
                    h-9 w-full rounded-lg text-xs font-medium transition-all
                    ${isSelected
                      ? 'bg-primary text-on-primary-container font-bold'
                      : isToday
                        ? 'bg-primary/10 text-primary font-bold hover:bg-primary/20'
                        : isDisabled
                          ? 'text-outline-variant cursor-not-allowed'
                          : 'text-on-surface hover:bg-surface-container-high'
                    }
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Today shortcut */}
          <button
            onClick={() => { onSelect(maxDate); setOpen(false) }}
            className="mt-3 w-full text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/10 py-2 rounded-lg transition-colors"
          >
            Go to Today
          </button>
        </div>
      )}
    </div>
  )
}
