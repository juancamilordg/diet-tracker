const BASE = '/api'

function getCurrentUserId(): string {
  return localStorage.getItem('currentUserId') || '0'
}

export function setCurrentUserId(id: number) {
  localStorage.setItem('currentUserId', String(id))
}

export function getStoredUserId(): number {
  return parseInt(getCurrentUserId(), 10)
}

function userHeaders(): Record<string, string> {
  return { 'X-User-ID': getCurrentUserId() }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...userHeaders(), ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(error.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  // Users
  getUsers: () => request<any[]>('/users'),
  createUser: (data: { display_name: string; telegram_id?: number }) =>
    request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),

  // Dashboard
  getDashboard: (date?: string) => request<any>(date ? `/dashboard?date=${date}` : '/dashboard'),

  // Meals
  getMeals: (params?: { limit?: number; offset?: number; date_from?: string; date_to?: string }) => {
    const search = new URLSearchParams()
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.offset) search.set('offset', String(params.offset))
    if (params?.date_from) search.set('date_from', params.date_from)
    if (params?.date_to) search.set('date_to', params.date_to)
    const qs = search.toString()
    return request<any[]>(`/meals${qs ? '?' + qs : ''}`)
  },
  getMeal: (id: number) => request<any>(`/meals/${id}`),
  createMeal: (data: any) => request<any>('/meals', { method: 'POST', body: JSON.stringify(data) }),
  updateMeal: (id: number, data: any) => request<any>(`/meals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMeal: (id: number) => request<void>(`/meals/${id}`, { method: 'DELETE' }),
  uploadMealPhoto: async (file: File): Promise<string> => {
    const form = new FormData()
    form.append('photo', file)
    const res = await fetch(`${BASE}/meals/upload-photo`, {
      method: 'POST',
      body: form,
      headers: userHeaders(),
    })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return data.photo_url
  },

  // Analyze
  analyzeMeal: async (data: { photo?: File; description?: string }) => {
    const form = new FormData()
    if (data.photo) form.append('photo', data.photo)
    if (data.description) form.append('description', data.description)
    const res = await fetch(`${BASE}/meals/analyze`, {
      method: 'POST',
      body: form,
      headers: userHeaders(),
    })
    if (!res.ok) throw new Error('Analysis failed')
    return res.json()
  },

  // Goals
  getGoals: () => request<any>('/goals'),
  updateGoals: (data: any) => request<any>('/goals', { method: 'PUT', body: JSON.stringify(data) }),

  // Water
  getWaterToday: () => request<any>('/water/today'),
  logWater: (amount_ml: number) => request<any>('/water', { method: 'POST', body: JSON.stringify({ amount_ml }) }),

  // Stats
  getWeeklyStats: () => request<any[]>('/stats/weekly'),
}
