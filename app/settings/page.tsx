'use client'

import { useState } from 'react'
import { mockCommissionSettings } from '@/lib/mock-data'
import { useSettingsStore, ALL_ROLES } from '@/lib/settings-store'
import { CommissionSetting, JobType } from '@/types'
import {
  ChevronDown, ChevronUp, Building2, Briefcase, DollarSign, Shield,
  Pencil, Trash2, Plus, Check, X,
} from 'lucide-react'

const roleLabels: Record<string, string> = {
  driver: 'Driver', installer: 'Installer', technician: 'Technician',
  sales_assistant: 'Sales Asst', secretary: 'Secretary', boss: 'Boss',
}

function SectionToggle({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left"
      >
        <span className="text-blue-500">{icon}</span>
        <span className="flex-1 text-sm font-semibold text-gray-900">{title}</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-50">{children}</div>}
    </div>
  )
}

function JobTypeSettings() {
  const { jobTypes, addJobType, updateJobType, toggleJobTypeRole, deleteJobType } = useSettingsStore()
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [addMode, setAddMode] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newRoles, setNewRoles] = useState<string[]>([])

  function startEdit(code: string, label: string) {
    setEditingCode(code)
    setEditLabel(label)
  }

  function confirmEdit(code: string) {
    if (editLabel.trim()) updateJobType(code, { label: editLabel.trim() })
    setEditingCode(null)
  }

  function toggleNewRole(role: string) {
    setNewRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])
  }

  function handleAdd() {
    if (!newCode.trim() || !newLabel.trim()) return
    addJobType(newCode.trim(), newLabel.trim(), newRoles)
    setNewCode('')
    setNewLabel('')
    setNewRoles([])
    setAddMode(false)
  }

  return (
    <div className="flex flex-col gap-0 pt-3">
      {jobTypes.map(jt => (
        <div key={jt.code} className="py-3 border-b border-gray-50 last:border-0">
          {/* Top row: code/label + controls */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              {editingCode === jt.code ? (
                <input
                  autoFocus
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmEdit(jt.code); if (e.key === 'Escape') setEditingCode(null) }}
                  className="w-full rounded-lg border border-blue-300 px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-800">{jt.code}</p>
                  <p className="text-xs text-gray-400">{jt.label}</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {editingCode === jt.code ? (
                <>
                  <button onClick={() => confirmEdit(jt.code)} className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100">
                    <Check size={14} className="text-green-600" />
                  </button>
                  <button onClick={() => setEditingCode(null)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200">
                    <X size={14} className="text-gray-500" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => updateJobType(jt.code, { active: !jt.active })}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                      jt.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {jt.active ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => startEdit(jt.code, jt.label)} className="p-1.5 rounded-lg hover:bg-gray-100">
                    <Pencil size={14} className="text-gray-400" />
                  </button>
                  <button onClick={() => deleteJobType(jt.code)} className="p-1.5 rounded-lg hover:bg-red-50">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Allowed roles row */}
          <div className="mt-2">
            <p className="text-xs text-gray-400 mb-1.5">Allowed staff roles:</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ROLES.map(role => {
                const allowed = jt.allowedRoles.includes(role)
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleJobTypeRole(jt.code, role)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      allowed
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {roleLabels[role] ?? role}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ))}

      {addMode ? (
        <div className="flex flex-col gap-3 pt-3">
          <div className="flex gap-2">
            <input
              autoFocus
              placeholder="Code (e.g. SVC)"
              value={newCode}
              onChange={e => setNewCode(e.target.value.toUpperCase())}
              className="w-24 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Label (e.g. Service Call)"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Select allowed roles:</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ROLES.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleNewRole(role)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    newRoles.includes(role)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {roleLabels[role] ?? role}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 h-9 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
              Add
            </button>
            <button onClick={() => { setAddMode(false); setNewCode(''); setNewLabel(''); setNewRoles([]) }} className="flex-1 h-9 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddMode(true)}
          className="flex items-center justify-center gap-1.5 w-full h-9 rounded-xl border border-dashed border-blue-300 text-blue-600 text-sm font-medium hover:bg-blue-50 mt-2"
        >
          <Plus size={15} /> Add Job Type
        </button>
      )}
    </div>
  )
}

function RolePermissionsSettings() {
  const { rolePermissions, addPermission, removePermission, updateRoleLabel } = useSettingsStore()
  const [addingFor, setAddingFor] = useState<string | null>(null)
  const [newPerm, setNewPerm] = useState('')
  const [editingLabel, setEditingLabel] = useState<string | null>(null)
  const [labelDraft, setLabelDraft] = useState('')

  function handleAddPerm(role: string) {
    if (!newPerm.trim()) return
    addPermission(role, newPerm.trim())
    setNewPerm('')
    setAddingFor(null)
  }

  return (
    <div className="flex flex-col gap-5 pt-3">
      {rolePermissions.map(({ role, label, permissions }) => (
        <div key={role}>
          <div className="flex items-center gap-2 mb-2">
            {editingLabel === role ? (
              <>
                <input
                  autoFocus
                  value={labelDraft}
                  onChange={e => setLabelDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { updateRoleLabel(role, labelDraft); setEditingLabel(null) }
                    if (e.key === 'Escape') setEditingLabel(null)
                  }}
                  className="flex-1 rounded-lg border border-blue-300 px-2 py-0.5 text-xs font-bold text-gray-700 uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={() => { updateRoleLabel(role, labelDraft); setEditingLabel(null) }} className="p-1 rounded hover:bg-green-50">
                  <Check size={12} className="text-green-600" />
                </button>
              </>
            ) : (
              <>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">{label}</p>
                <button onClick={() => { setEditingLabel(role); setLabelDraft(label) }} className="p-0.5 rounded hover:bg-gray-100">
                  <Pencil size={11} className="text-gray-400" />
                </button>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {permissions.map(perm => (
              <span key={perm} className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-600 pl-2 pr-1 py-1 rounded-lg">
                {perm}
                <button onClick={() => removePermission(role, perm)} className="hover:bg-gray-300 rounded p-0.5">
                  <X size={10} className="text-gray-500" />
                </button>
              </span>
            ))}
            {addingFor === role ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={newPerm}
                  onChange={e => setNewPerm(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddPerm(role); if (e.key === 'Escape') setAddingFor(null) }}
                  placeholder="New permission"
                  className="w-32 rounded-lg border border-blue-300 px-2 py-0.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button onClick={() => handleAddPerm(role)} className="p-1 rounded hover:bg-green-50">
                  <Check size={12} className="text-green-600" />
                </button>
                <button onClick={() => { setAddingFor(null); setNewPerm('') }} className="p-1 rounded hover:bg-gray-100">
                  <X size={12} className="text-gray-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAddingFor(role); setNewPerm('') }}
                className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-500 border border-dashed border-blue-300 px-2 py-1 rounded-lg hover:bg-blue-50"
              >
                <Plus size={11} /> Add
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SettingsPage() {
  const [company, setCompany] = useState({
    name: 'Chang Sin Electrical',
    branch: 'HQ - Ampang',
    whatsapp: '013-5566778',
    address: 'No. 1, Jalan Changsin, 68000 Ampang, Selangor',
  })

  const [commissions, setCommissions] = useState<CommissionSetting[]>(mockCommissionSettings)

  function handleCompanyChange(field: keyof typeof company, value: string) {
    setCompany(c => ({ ...c, [field]: value }))
  }

  function handleCommissionChange(jobType: JobType, value: number) {
    setCommissions(cs => cs.map(c => c.jobType === jobType ? { ...c, amount: value } : c))
  }

  return (
    <div className="px-4 pt-6 pb-4 flex flex-col gap-3">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Settings</h1>

      {/* A. Company Profile */}
      <SectionToggle title="Company Profile" icon={<Building2 size={18} />}>
        <div className="flex flex-col gap-4 pt-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <Building2 size={24} className="text-blue-500" />
            </div>
            <button className="text-xs font-medium text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50">
              Upload Logo
            </button>
          </div>
          <SettingField label="Company Name" value={company.name} onChange={v => handleCompanyChange('name', v)} />
          <SettingField label="Branch" value={company.branch} onChange={v => handleCompanyChange('branch', v)} />
          <SettingField label="WhatsApp" value={company.whatsapp} onChange={v => handleCompanyChange('whatsapp', v)} type="tel" />
          <SettingField label="Address" value={company.address} onChange={v => handleCompanyChange('address', v)} />
          <button className="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all">
            Save Changes
          </button>
        </div>
      </SectionToggle>

      {/* B. Job Type Settings */}
      <SectionToggle title="Job Type Settings" icon={<Briefcase size={18} />}>
        <JobTypeSettings />
      </SectionToggle>

      {/* C. Commission Settings */}
      <SectionToggle title="Commission Settings" icon={<DollarSign size={18} />}>
        <div className="flex flex-col gap-3 pt-3">
          {commissions.map(c => (
            <div key={c.jobType} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{c.jobType}</p>
                <p className="text-xs text-gray-400 capitalize">{c.type}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500 font-medium">RM</span>
                <input
                  type="number"
                  min={0}
                  value={c.amount}
                  onChange={e => handleCommissionChange(c.jobType, Number(e.target.value))}
                  className="w-20 rounded-xl border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-800 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
          <button className="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all mt-2">
            Save Commission
          </button>
        </div>
      </SectionToggle>

      {/* D. Role Permissions */}
      <SectionToggle title="Role Permissions" icon={<Shield size={18} />}>
        <RolePermissionsSettings />
      </SectionToggle>
    </div>
  )
}

function SettingField({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
