'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type JobTypeSetting = {
  code: string
  label: string
  active: boolean
  allowedRoles: string[]
}

export type RolePermissionSetting = {
  role: string
  label: string
  permissions: string[]
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
  addJobType: (code: string, label: string, allowedRoles: string[]) => void
  updateJobType: (code: string, patch: Partial<Pick<JobTypeSetting, 'label' | 'active'>>) => void
  toggleJobTypeRole: (code: string, role: string) => void
  deleteJobType: (code: string) => void
  addPermission: (role: string, permission: string) => void
  removePermission: (role: string, permission: string) => void
  updateRoleLabel: (role: string, label: string) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      jobTypes: defaultJobTypes,
      rolePermissions: defaultRolePermissions,

      addJobType: (code, label, allowedRoles) => set(s => ({
        jobTypes: [...s.jobTypes, { code: code.trim().toUpperCase(), label: label.trim(), active: true, allowedRoles }],
      })),

      updateJobType: (code, patch) => set(s => ({
        jobTypes: s.jobTypes.map(jt => jt.code === code ? { ...jt, ...patch } : jt),
      })),

      toggleJobTypeRole: (code, role) => set(s => ({
        jobTypes: s.jobTypes.map(jt => {
          if (jt.code !== code) return jt
          const has = jt.allowedRoles.includes(role)
          return {
            ...jt,
            allowedRoles: has
              ? jt.allowedRoles.filter(r => r !== role)
              : [...jt.allowedRoles, role],
          }
        }),
      })),

      deleteJobType: (code) => set(s => ({
        jobTypes: s.jobTypes.filter(jt => jt.code !== code),
      })),

      addPermission: (role, permission) => set(s => ({
        rolePermissions: s.rolePermissions.map(rp =>
          rp.role === role && !rp.permissions.includes(permission)
            ? { ...rp, permissions: [...rp.permissions, permission] }
            : rp
        ),
      })),

      removePermission: (role, permission) => set(s => ({
        rolePermissions: s.rolePermissions.map(rp =>
          rp.role === role
            ? { ...rp, permissions: rp.permissions.filter(p => p !== permission) }
            : rp
        ),
      })),

      updateRoleLabel: (role, label) => set(s => ({
        rolePermissions: s.rolePermissions.map(rp =>
          rp.role === role ? { ...rp, label } : rp
        ),
      })),
    }),
    {
      name: 'changsin-settings',
      version: 1,
      migrate: (persisted: unknown) => {
        const state = persisted as { jobTypes?: JobTypeSetting[] }
        if (state?.jobTypes) {
          state.jobTypes = state.jobTypes.map(jt => ({
            ...jt,
            allowedRoles: jt.allowedRoles ?? ALL_ROLES.filter(r => r !== 'sales_assistant'),
          }))
        }
        return state
      },
    }
  )
)
