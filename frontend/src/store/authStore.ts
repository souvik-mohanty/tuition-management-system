import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession, TuitionMembership, User } from '@/types'

interface AuthState {
  accessToken: string | null
  user: User | null
  memberships: TuitionMembership[]
  setSession: (session: AuthSession) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      memberships: [],
      setSession: ({ accessToken, user, memberships }) => set({ accessToken, user, memberships }),
      clearSession: () => set({ accessToken: null, user: null, memberships: [] }),
    }),
    { name: 'classops-auth' },
  ),
)
