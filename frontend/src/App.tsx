import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from './UserContext'
import PageLayout from './components/layout/PageLayout'
import Dashboard from './pages/Dashboard'
import LogHistory from './pages/LogHistory'
import MealEdit from './pages/MealEdit'
import Settings from './pages/Settings'

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PageLayout />}>
            <Route path="/" element={<Navigate to="/dash" replace />} />
            <Route path="/dash" element={<Dashboard />} />
            <Route path="/log" element={<LogHistory />} />
            <Route path="/add" element={<MealEdit />} />
            <Route path="/edit/:id" element={<MealEdit />} />
            <Route path="/goals" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  )
}
