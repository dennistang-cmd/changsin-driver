'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Staff, UserRole, CommissionType } from '@/types'
import { mockStaff } from './mock-data'

type StaffStore = {
  staff: Staff[]
  addStaff: (input: Omit<Staff, 'id' | 'isActive'>) => void
  updateStaff: (id: string, patch: Partial<Omit<Staff, 'id'>>) => void
  deleteStaff: (id: string) => void
  toggleActive: (id: string) => void
}

export const useStaffStore = create<StaffStore>()(
  persist(
    (set) => ({
      staff: mockStaff,

      addStaff: (input) => set(s => ({
        staff: [{ ...input, id: `staff-${Date.now()}`, isActive: true }, ...s.staff],
      })),

      updateStaff: (id, patch) => set(s => ({
        staff: s.staff.map(m => m.id === id ? { ...m, ...patch } : m),
      })),

      deleteStaff: (id) => set(s => ({
        staff: s.staff.filter(m => m.id !== id),
      })),

      toggleActive: (id) => set(s => ({
        staff: s.staff.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m),
      })),
    }),
    { name: 'changsin-staff' }
  )
)

export type { UserRole, CommissionType }
