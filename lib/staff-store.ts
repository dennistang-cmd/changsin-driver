'use client'

import { create } from 'zustand'
import { Staff, UserRole, CommissionType } from '@/types'
import { mockStaff } from './mock-data'
import { supabase } from './supabase'

type StaffStore = {
  staff: Staff[]
  isLoading: boolean
  loadStaff: () => Promise<void>
  addStaff: (input: Omit<Staff, 'id' | 'isActive'>) => Promise<void>
  updateStaff: (id: string, patch: Partial<Omit<Staff, 'id'>>) => Promise<void>
  deleteStaff: (id: string) => Promise<void>
  toggleActive: (id: string) => Promise<void>
}

function dbToStaff(row: Record<string, unknown>): Staff {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    role: row.role as UserRole,
    loginId: row.login_id as string,
    password: row.password as string,
    isActive: row.is_active as boolean,
    commissionType: row.commission_type as CommissionType,
    commissionAmount: Number(row.commission_amount),
    lastActive: row.last_active as string | undefined,
  }
}

function staffToDb(s: Staff) {
  return {
    id: s.id,
    name: s.name,
    phone: s.phone,
    role: s.role,
    login_id: s.loginId,
    password: s.password ?? '1234',
    is_active: s.isActive,
    commission_type: s.commissionType,
    commission_amount: s.commissionAmount,
    last_active: s.lastActive ?? null,
  }
}

export const useStaffStore = create<StaffStore>()((set, get) => ({
  staff: [],
  isLoading: true,

  loadStaff: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase.from('cs_staff').select('*').order('name')

    if (error) { set({ isLoading: false }); return }

    // Seed default staff if table is empty
    if (!data || data.length === 0) {
      await supabase.from('cs_staff').insert(mockStaff.map(staffToDb))
      set({ staff: mockStaff, isLoading: false })
      return
    }

    set({ staff: data.map(dbToStaff), isLoading: false })
  },

  addStaff: async (input) => {
    const newStaff: Staff = { ...input, id: `staff-${Date.now()}`, isActive: true }
    await supabase.from('cs_staff').insert(staffToDb(newStaff))
    set(s => ({ staff: [newStaff, ...s.staff] }))
  },

  updateStaff: async (id, patch) => {
    const current = get().staff.find(s => s.id === id)
    if (!current) return
    const updated = { ...current, ...patch }
    await supabase.from('cs_staff').update(staffToDb(updated)).eq('id', id)
    set(s => ({ staff: s.staff.map(m => m.id === id ? updated : m) }))
  },

  deleteStaff: async (id) => {
    await supabase.from('cs_staff').delete().eq('id', id)
    set(s => ({ staff: s.staff.filter(m => m.id !== id) }))
  },

  toggleActive: async (id) => {
    const current = get().staff.find(s => s.id === id)
    if (!current) return
    const newActive = !current.isActive
    await supabase.from('cs_staff').update({ is_active: newActive }).eq('id', id)
    set(s => ({ staff: s.staff.map(m => m.id === id ? { ...m, isActive: newActive } : m) }))
  },
}))

export type { UserRole, CommissionType }
