import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'

interface DataPoint {
  date: string
  total_calories: number
}

interface Props {
  data: DataPoint[]
  target: number
}

const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

export default function WeeklyChart({ data, target }: Props) {
  const isDark = useIsDark()

  const chartData = data.map(d => {
    const day = new Date(d.date + 'T12:00:00').getDay()
    return { ...d, day: dayLabels[day], cals: d.total_calories }
  })

  const nearTarget = (cal: number) => cal >= target * 0.85

  // Count streak
  const streak = chartData.filter(d => nearTarget(d.cals)).length

  const colors = isDark
    ? { active: '#caff6f', inactive: '#192540', ref: '#caff6f', tick: '#a3aac4', tooltipBg: '#141f38', tooltipText: '#dee5ff', glow: 'drop-shadow(0 0 8px rgba(202,255,111,0.2))' }
    : { active: '#456500', inactive: '#d9dde0', ref: '#456500', tick: '#747779', tooltipBg: '#ffffff', tooltipText: '#2c2f31', glow: 'drop-shadow(0 0 6px rgba(69,101,0,0.15))' }

  return (
    <section className="bg-surface-container p-8 rounded-xl">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h3 className="text-2xl font-bold text-on-surface">Weekly Lab Adherence</h3>
          <p className="text-sm text-on-surface-variant">Caloric consistency over the last 7 cycles</p>
        </div>
        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
          Optimal Streak: {streak} Days
        </span>
      </div>
      <ResponsiveContainer width="100%" height={192}>
        <BarChart data={chartData} barCategoryGap="20%">
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.tick, fontSize: 10, fontWeight: 500 }}
          />
          <YAxis hide />
          <Tooltip
            cursor={false}
            contentStyle={{
              background: colors.tooltipBg,
              border: isDark ? 'none' : '1px solid #d9dde0',
              borderRadius: '8px',
              color: colors.tooltipText,
              fontSize: 12,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
            }}
            formatter={(val: number) => [`${(val / 1000).toFixed(1)}k kcal`, '']}
          />
          <ReferenceLine y={target} stroke={colors.ref} strokeDasharray="3 3" strokeOpacity={0.3} />
          <Bar dataKey="cals" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={nearTarget(entry.cals) ? colors.active : colors.inactive}
                style={nearTarget(entry.cals) ? { filter: colors.glow } : {}}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
