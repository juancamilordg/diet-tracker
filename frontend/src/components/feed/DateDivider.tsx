interface Props {
  date: string
  isToday?: boolean
}

export default function DateDivider({ date, isToday }: Props) {
  return (
    <div className="flex items-center gap-4 px-2">
      <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${isToday ? 'text-primary' : 'text-on-surface-variant'}`}>
        {isToday ? 'Today — ' : ''}{date}
      </span>
      <div className="h-[1px] flex-grow bg-surface-container-highest" />
    </div>
  )
}
