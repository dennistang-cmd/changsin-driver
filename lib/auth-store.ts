'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Staff } from '@/types'

type AuthStore = {
  currentUser: Staff | null
  login: (staff: Staff) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      currentUser: null,
      login: (staff) => set({ currentUser: staff }),
      logout: () => set({ currentUser: null }),
    }),
    { name: 'changsin-auth', skipHydration: true }
  )
)
