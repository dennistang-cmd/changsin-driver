'use client'

import { useState } from 'react'
import { mockCommissionSettings } from '@/lib/mock-data'
import { CommissionSetting, JobType, UserRole } from '@/types'
import { ChevronDown, ChevronUp, Building2, Briefcase, DollarSign, Shield } from 'lucide-react'

const jobTypes: JobType[] = ['DO', 'JO', 'Repair', 'Installation']

const rolePermissions: { role: UserRole; label: string; permissions: string[] }[] = [
  { role: 'driver',     label: 'Driver',     permissions: ['Upload DO/JO', 'Update Status'] },
  { role: 'installer',  label: 'Installer',  permissions: ['Upload JO', 'Update Progress', 'Upload Evidence'] },
  { role: 'technician', label: 'Technician', permissions: ['Upload Repair', 'Update Status', 'Upload Evidence'] },
  { role: 'secretary',  label: 'Secretary',  permissions: ['Create Jobs', 'Edit Jobs', 'Assign Staff', 'Verify Work'] },
  { role: 'boss',       label: 'Boss',       permissions: ['Full Access', 'All Reports', 'Staff Mgmt', 'Commission'] },
]

const jobTypeLabels: Record<JobType, string> = {
  DO: 'Delivery Order (DO)',
  JO: 'Job Order (JO)',
  Repair: 'Repair / Service',
  Installation: 'Installation',
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

  function handleCommissionChange(jobType: JobType, field: 'amount', value: number) {
    setCommissions(cs => cs.map(c => c.jobType === jobType ? { ...c, [field]: value } : c))
  }

  return (
    <div className="px-4 pt-6 pb-4 flex flex-col gap-3">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Settings</h1>

      {/* A. Company Profile */}
      <SectionToggle title="Company Profile" icon={<Building2 size={18} />}>
        <div className="flex flex-col gap-4 pt-3">
          {/* Logo placeholder */}
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
        <div className="flex flex-col gap-2 pt-3">
          {jobTypes.map(type => (
            <div key={type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-gray-800">{type}</p>
                <p className="text-xs text-gray-400">{jobTypeLabels[type]}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">Active</span>
              </div>
            </div>
          ))}
        </div>
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
                  onChange={e => handleCommissionChange(c.jobType, 'amount', Number(e.target.value))}
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
        <div className="flex flex-col gap-4 pt-3">
          {rolePermissions.map(({ role, label, permissions }) => (
            <div key={role}>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">{label}</p>
              <div className="flex flex-wrap gap-2">
                {permissions.map(perm => (
                  <span key={perm} className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
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
