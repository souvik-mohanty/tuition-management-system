import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TenantState {
  currentTuitionId: string | null
  setCurrentTuition: (id: string | null) => void
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      currentTuitionId: null,
      setCurrentTuition: (id) => set({ currentTuitionId: id }),
    }),
    { name: 'classops-tenant' },
  ),
)
