'use client'

import { create } from 'zustand'
import { supabase } from './supabase'

export type JobTypeSetting = {
  code: string; label: string; active: boolean; allowedRoles: string[]
}

export type RolePermissionSetting = {
  role: string; label: string; permissions: string[]
}

export const ALL_ROLES = ['driver', 'installer', 'technician', 'sales_assistant', 'secretary', 'boss'] as const

const defaultJobTypes: JobTypeSetting[] = [
  { code: 'DO',           label: 'Delivery Order',  active: true, allowedRoles: ['driver', 'installer', 'technician', 'secretary', 'boss'] },
  { code: 'JO',           label: 'Job Order',        active: true, allowedRoles: ['installer', 'technician', 'secretary', 'boss'] },
  { code: 'Repair',       label: 'Repair / Service', active: true, allowedRoles: ['technician', 'secretary', 'boss'] },
  { code: 'Installation', label: 'Installation',     active: true, allowedRoles: ['installer', 'technician', 'secretary', 'boss'] },
]

const defaultRolePermissions: RolePermissionSetting[] = [
  { role: 'driver',          label: 'Driver',          permissions: ['Upload DO/JO', 'Update Status'] },
  { role: 'installer',       label: 'Installer',       permissions: ['Upload JO', 'Update Progress', 'Upload Evidence'] },
  { role: 'technician',      label: 'Technician',      permissions: ['Upload Repair', 'Update Status', 'Upload Evidence'] },
  { role: 'sales_assistant', label: 'Sales Assistant', permissions: ['Create Quotation', 'View Jobs', 'Upload DO'] },
  { role: 'secretary',       label: 'Secretary',       permissions: ['Create Jobs', 'Edit Jobs', 'Assign Staff', 'Verify Work'] },
  { role: 'boss',            label: 'Boss',            permissions: ['Full Access', 'All Reports', 'Staff Mgmt', 'Commission'] },
]

type SettingsStore = {
  jobTypes: JobTypeSetting[]
  rolePermissions: RolePermissionSetting[]
  isLoading: boolean
  loadSettings: () => Promise<void>
  addJobType: (code: string, label: string, allowedRoles: string[]) => Promise<void>
  updateJobType: (code: string, patch: Partial<Pick<JobTypeSetting, 'label' | 'active'>>) => Promise<void>
  toggleJobTypeRole: (code: string, role: string) => Promise<void>
  deleteJobType: (code: string) => Promise<void>
  addPermission: (role: string, permission: string) => Promise<void>
  removePermission: (role: string, permission: string) => Promise<void>
  updateRoleLabel: (role: string, label: string) => Promise<void>
}

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  jobTypes: [],
  rolePermissions: [],
  isLoading: true,

  loadSettings: async () => {
    set({ isLoading: true })
    const [{ data: jt }, { data: rp }] = await Promise.all([
      supabase.from('cs_job_types').select('*').order('code'),
      supabase.from('cs_role_permissions').select('*').order('role'),
    ])

    // Seed defaults if empty
    if (!jt || jt.length === 0) {
      await supabase.from('cs_job_types').insert(
        defaultJobTypes.map(j => ({ code: j.code, label: j.label, active: j.active, allowed_roles: j.allowedRoles }))
      )
    }
    if (!rp || rp.length === 0) {
      await supabase.from('cs_role_permissions').insert(
        defaultRolePermissions.map(r => ({ role: r.role, label: r.label, permissions: r.permissions }))
      )
    }

    const jobTypes = (jt && jt.length > 0 ? jt : defaultJobTypes.map(j => ({
      code: j.code, label: j.label, active: j.active, allowed_roles: j.allowedRoles,
    }))).map(r => ({
      code: r.code as string,
      label: r.label as string,
      active: r.active as boolean,
      allowedRoles: (r.allowed_roles ?? []) as string[],
    }))

    const rolePermissions = (rp && rp.length > 0 ? rp : defaultRolePermissions.map(r => ({
      role: r.role, label: r.label, permissions: r.permissions,
    }))).map(r => ({
      role: r.role as string,
      label: r.label as string,
      permissions: (r.permissions ?? []) as string[],
    }))

    set({ jobTypes, rolePermissions, isLoading: false })
  },

  addJobType: async (code, label, allowedRoles) => {
    const entry: JobTypeSetting = { code: code.trim().toUpperCase(), label: label.trim(), active: true, allowedRoles }
    await supabase.from('cs_job_types').insert({ code: entry.code, label: entry.label, active: true, allowed_roles: allowedRoles })
    set(s => ({ jobTypes: [...s.jobTypes, entry] }))
  },

  updateJobType: async (code, patch) => {
    const dbPatch: Record<string, unknown> = {}
    if (patch.label  !== undefined) dbPatch.label  = patch.label
    if (patch.active !== undefined) dbPatch.active = patch.active
    await supabase.from('cs_job_types').update(dbPatch).eq('code', code)
    set(s => ({ jobTypes: s.jobTypes.map(jt => jt.code === code ? { ...jt, ...patch } : jt) }))
  },

  toggleJobTypeRole: async (code, role) => {
    const jt = get().jobTypes.find(j => j.code === code)
    if (!jt) return
    const newRoles = jt.allowedRoles.includes(role)
      ? jt.allowedRoles.filter(r => r !== role)
      : [...jt.allowedRoles, role]
    await supabase.from('cs_job_types').update({ allowed_roles: newRoles }).eq('code', code)
    set(s => ({ jobTypes: s.jobTypes.map(j => j.code === code ? { ...j, allowedRoles: newRoles } : j) }))
  },

  deleteJobType: async (code) => {
    await supabase.from('cs_job_types').delete().eq('code', code)
    set(s => ({ jobTypes: s.jobTypes.filter(jt => jt.code !== code) }))
  },

  addPermission: async (role, permission) => {
    const rp = get().rolePermissions.find(r => r.role === role)
    if (!rp || rp.permissions.includes(permission)) return
    const newPerms = [...rp.permissions, permission]
    await supabase.from('cs_role_permissions').update({ permissions: newPerms }).eq('role', role)
    set(s => ({ rolePermissions: s.rolePermissions.map(r => r.role === role ? { ...r, permissions: newPerms } : r) }))
  },

  removePermission: async (role, permission) => {
    const rp = get().rolePermissions.find(r => r.role === role)
    if (!rp) return
    const newPerms = rp.permissions.filter(p => p !== permission)
    await supabase.from('cs_role_permissions').update({ permissions: newPerms }).eq('role', role)
    set(s => ({ rolePermissions: s.rolePermissions.map(r => r.role === role ? { ...r, permissions: newPerms } : r) }))
  },

  updateRoleLabel: async (role, label) => {
    await supabase.from('cs_role_permissions').update({ label }).eq('role', role)
    set(s => ({ rolePermissions: s.rolePermissions.map(r => r.role === role ? { ...r, label } : r) }))
  },
}))
