import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api, getStoredUserId, setCurrentUserId } from './api/client'

interface User {
  id: number
  telegram_id: number | null
  display_name: string
}

interface UserContextType {
  users: User[]
  currentUserId: number
  currentUser: User | null
  switchUser: (id: number) => void
  refreshUsers: () => Promise<void>
}

const UserCtx = createContext<UserContextType>({
  users: [],
  currentUserId: 0,
  currentUser: null,
  switchUser: () => {},
  refreshUsers: async () => {},
})

export function useUser() {
  return useContext(UserCtx)
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [currentUserId, setUserId] = useState(getStoredUserId())

  const refreshUsers = useCallback(async () => {
    try {
      const data = await api.getUsers()
      setUsers(data)
      // Auto-select first user if stored ID doesn't match any user
      const storedId = getStoredUserId()
      if (data.length > 0 && !data.find((u: User) => u.id === storedId)) {
        setCurrentUserId(data[0].id)
        setUserId(data[0].id)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    refreshUsers()
  }, [refreshUsers])

  const switchUser = useCallback((id: number) => {
    setCurrentUserId(id)
    setUserId(id)
    window.location.reload()
  }, [])

  const currentUser = users.find(u => u.id === currentUserId) || null

  return (
    <UserCtx.Provider value={{ users, currentUserId, currentUser, switchUser, refreshUsers }}>
      {children}
    </UserCtx.Provider>
  )
}
