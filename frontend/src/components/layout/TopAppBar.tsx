import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUser } from '../../UserContext'

const navItems = [
  { path: '/dash', label: 'Dash' },
  { path: '/log', label: 'Log' },
  { path: '/goals', label: 'Goals' },
]

export default function TopAppBar() {
  const { pathname } = useLocation()
  const { users, currentUser, switchUser } = useUser()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initial = currentUser?.display_name?.charAt(0)?.toUpperCase() || '?'

  return (
    <header className="fixed top-0 w-full z-50 glass flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-3">
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden flex items-center justify-center text-primary text-sm font-bold hover:opacity-80 transition-opacity"
          >
            {initial}
          </button>
          {open && users.length > 0 && (
            <div className="absolute left-0 top-12 bg-surface-container rounded-xl border border-outline-variant/20 shadow-xl min-w-[160px] py-1 z-50">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => { switchUser(user.id); setOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-surface-container-high transition-colors ${
                    user.id === currentUser?.id ? 'text-primary font-semibold' : 'text-on-surface'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {user.display_name.charAt(0).toUpperCase()}
                  </span>
                  {user.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
        <h1 className="text-on-surface font-black tracking-tighter text-xl">NUTRITION TRACKER</h1>
      </div>
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex gap-8 items-center tracking-widest uppercase text-xs font-bold">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={pathname === item.path
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface transition-all'
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
