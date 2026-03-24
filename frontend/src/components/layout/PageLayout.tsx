import { Outlet } from 'react-router-dom'
import TopAppBar from './TopAppBar'
import BottomNav from './BottomNav'

export default function PageLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar />
      <main className="pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
