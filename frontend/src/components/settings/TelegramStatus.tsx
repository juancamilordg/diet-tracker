export default function TelegramStatus() {
  return (
    <div className="md:col-span-7 bg-surface-container-high p-8 rounded-xl flex items-center gap-8 group">
      <div className="w-16 h-16 rounded-2xl bg-[#0088cc]/20 flex items-center justify-center text-[#0088cc] shrink-0">
        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="text-lg font-bold tracking-tight text-on-surface">Telegram Bot Integration</h4>
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            Connected
          </span>
        </div>
        <p className="text-sm text-on-surface-variant leading-snug">
          Real-time macro logging and performance alerts enabled via @KineticLabBot.
        </p>
      </div>
      <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
        <span className="material-symbols-outlined">settings</span>
      </button>
    </div>
  )
}
