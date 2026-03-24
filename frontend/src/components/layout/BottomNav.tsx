import { Link, useLocation } from 'react-router-dom'

const items = [
  { path: '/dash', icon: 'insert_chart' },
  { path: '/add', icon: 'add_circle' },
  { path: '/log', icon: 'history' },
  { path: '/goals', icon: 'settings' },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-4 glass z-50 rounded-t-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {items.map(item => {
        const active = pathname === item.path || (item.path === '/add' && pathname.startsWith('/edit'))
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-150 ${
              active
                ? 'text-primary bg-surface-container rounded-xl px-3 py-1'
                : 'text-[#a3aac4] hover:text-[#dee5ff]'
            }`}
          >
            <span className={`material-symbols-outlined ${item.path === '/add' && !active ? 'text-4xl text-primary' : ''}`}>
              {item.icon}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
