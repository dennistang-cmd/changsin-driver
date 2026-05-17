'use client'

import { useState } from 'react'
import { mockStaff } from '@/lib/mock-data'
import { Staff, UserRole, CommissionType } from '@/types'
import { Plus, Phone, User, ChevronDown, X } from 'lucide-react'

const roleColors: Record<UserRole, string> = {
  driver:     'bg-blue-100 text-blue-700',
  installer:  'bg-indigo-100 text-indigo-700',
  technician: 'bg-purple-100 text-purple-700',
  secretary:  'bg-amber-100 text-amber-700',
  boss:       'bg-green-100 text-green-700',
}

const roles: UserRole[] = ['driver', 'installer', 'technician', 'secretary', 'boss']

const defaultForm = {
  name: '', phone: '', role: 'driver' as UserRole, loginId: '',
  password: '', commissionType: 'fixed' as CommissionType, commissionAmount: 0,
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>(mockStaff)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(defaultForm)

  function handleToggle(id: string) {
    setStaff(s => s.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m))
  }

  function handleAdd() {
    const newMember: Staff = {
      id: `staff-${Date.now()}`,
      ...form,
      isActive: true,
    }
    setStaff(s => [newMember, ...s])
    setForm(defaultForm)
    setShowModal(false)
  }

  function handleChange<K extends keyof typeof defaultForm>(key: K, value: typeof defaultForm[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Staff</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {staff.map(member => (
          <div key={member.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 ${!member.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <User size={20} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColors[member.role]}`}>
                    {member.role}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Phone size={12} className="text-gray-400" />
                  <p className="text-xs text-gray-500">{member.phone}</p>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">ID: {member.loginId}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Commission: {member.commissionType === 'fixed' ? `RM${member.commissionAmount}` : `${member.commissionAmount}%`} per job
                </p>
              </div>
              <button
                onClick={() => handleToggle(member.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  member.isActive ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                aria-label={member.isActive ? 'Deactivate' : 'Activate'}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                  member.isActive ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl px-5 pt-6 pb-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Add Staff</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <ModalField label="Full Name" placeholder="e.g. Ahmad Razif" value={form.name} onChange={v => handleChange('name', v)} />
              <ModalField label="Phone" placeholder="012-3456789" value={form.phone} onChange={v => handleChange('phone', v)} type="tel" />
              <ModalField label="Login ID" placeholder="e.g. ahmad.driver" value={form.loginId} onChange={v => handleChange('loginId', v)} />
              <ModalField label="Password" placeholder="Set password" value={form.password} onChange={v => handleChange('password', v)} type="password" />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">Role</label>
                <div className="relative">
                  <select
                    value={form.role}
                    onChange={e => handleChange('role', e.target.value as UserRole)}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roles.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">Commission Type</label>
                  <div className="relative">
                    <select
                      value={form.commissionType}
                      onChange={e => handleChange('commissionType', e.target.value as CommissionType)}
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="fixed">Fixed (RM)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="w-28 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">Amount</label>
                  <input
                    type="number"
                    min={0}
                    value={form.commissionAmount}
                    onChange={e => handleChange('commissionAmount', Number(e.target.value))}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all mt-2"
              >
                Add Staff Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ModalField({ label, placeholder, value, onChange, type = 'text' }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
