'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useJobsStore } from '@/lib/jobs-store'
import { useStaffStore } from '@/lib/staff-store'
import { Job } from '@/types'
import {
  ArrowLeft, Printer, DollarSign, CheckCircle2, Users, ChevronDown, ChevronUp,
} from 'lucide-react'

type StaffEntry = {
  name: string
  role: string
  jobs: { job: Job; amount: number }[]
  total: number
}

function getMonthKey(ts: string) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatMonth(key: string) {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })
}

function fmt(n: number) {
  return `RM ${n.toFixed(2)}`
}

export default function CommissionPage() {
  const router = useRouter()
  const jobs = useJobsStore(s => s.jobs)
  const allStaff = useStaffStore(s => s.staff)

  // Verified jobs only
  const verifiedJobs = jobs.filter(j => j.verifyStatus === 'verified' && j.commissionAmount != null)

  // Month options
  const allMonths = [...new Set(verifiedJobs.map(j => getMonthKey(j.createdAt)))].sort().reverse()
  const [selectedMonth, setSelectedMonth] = useState<string>(allMonths[0] ?? getMonthKey(new Date().toISOString()))
  const [expandedStaff, setExpandedStaff] = useState<Set<string>>(new Set())

  const filteredJobs = selectedMonth === 'all'
    ? verifiedJobs
    : verifiedJobs.filter(j => getMonthKey(j.createdAt) === selectedMonth)

  // Build per-staff commission map
  const staffMap = new Map<string, StaffEntry>()

  for (const job of filteredJobs) {
    const staffList = job.assignedStaff?.length ? job.assignedStaff : ['Unassigned']
    const perPerson = (job.commissionAmount ?? 0) / staffList.length

    for (const name of staffList) {
      if (!staffMap.has(name)) {
        const member = allStaff.find(s => s.name === name)
        staffMap.set(name, { name, role: member?.role ?? '—', jobs: [], total: 0 })
      }
      const entry = staffMap.get(name)!
      entry.jobs.push({ job, amount: perPerson })
      entry.total += perPerson
    }
  }

  const staffEntries = [...staffMap.values()].sort((a, b) => b.total - a.total)
  const grandTotal = staffEntries.reduce((s, e) => s + e.total, 0)

  function toggleExpand(name: string) {
    setExpandedStaff(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function handlePrintAll() {
    window.print()
  }

  function handlePrintStaff(name: string) {
    // Expand that staff so it prints
    setExpandedStaff(new Set([name]))
    setTimeout(() => {
      const el = document.getElementById(`staff-section-${name.replace(/\s/g, '-')}`)
      if (!el) { window.print(); return }
      const clone = el.cloneNode(true) as HTMLElement
      const win = window.open('', '_blank', 'width=800,height=600')
      if (!win) return
      win.document.write(`
        <html><head><title>Commission — ${name}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 32px; color: #111; }
          h1 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
          .sub { font-size: 12px; color: #666; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #f5f5f5; text-align: left; padding: 8px 12px; font-weight: 600; }
          td { padding: 8px 12px; border-bottom: 1px solid #eee; }
          .total-row td { font-weight: 700; border-top: 2px solid #ccc; background: #f9f9f9; }
          .badge { display:inline-block; padding:2px 8px; border-radius:99px; font-size:11px; font-weight:600; background:#dbeafe; color:#1d4ed8; text-transform:capitalize; }
        </style></head><body>
        <h1>Commission Report — ${name}</h1>
        <p class="sub">Chang Sin Electrical &nbsp;·&nbsp; ${selectedMonth === 'all' ? 'All Time' : formatMonth(selectedMonth)}</p>
        <table>
          <thead><tr><th>Job No</th><th>Customer</th><th>Product</th><th>Date</th><th style="text-align:right">Commission</th></tr></thead>
          <tbody>
            ${staffMap.get(name)?.jobs.map(({ job, amount }) => `
              <tr>
                <td>${job.jobNumber}</td>
                <td>${job.customer.name}</td>
                <td>${job.product}</td>
                <td>${new Date(job.createdAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td style="text-align:right">${fmt(amount)}</td>
              </tr>`).join('') ?? ''}
            <tr class="total-row">
              <td colspan="4">Total</td>
              <td style="text-align:right">${fmt(staffMap.get(name)?.total ?? 0)}</td>
            </tr>
          </tbody>
        </table>
        <script>window.onload=()=>{window.print();window.close()}<\/script>
        </body></html>
      `)
      win.document.close()
    }, 100)
  }

  return (
    <>
      {/* ── Print styles ────────────────────────────── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-always { display: block !important; }
          body { font-size: 12px; }
          .staff-jobs { display: block !important; }
        }
      `}</style>

      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 no-print">
          <button onClick={() => router.back()} className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-900">Commission Report</h1>
            <p className="text-xs text-gray-400">Verified jobs only</p>
          </div>
          <button
            onClick={handlePrintAll}
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Printer size={15} /> Print All
          </button>
        </div>

        {/* Print header (hidden on screen) */}
        <div className="hidden print-always px-6 pt-6 pb-2">
          <h1 className="text-2xl font-bold text-gray-900">Commission Report</h1>
          <p className="text-sm text-gray-500">Chang Sin Electrical · {selectedMonth === 'all' ? 'All Time' : formatMonth(selectedMonth)}</p>
        </div>

        <div className="flex-1 px-4 py-4 flex flex-col gap-4">

          {/* Month filter */}
          <div className="no-print">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                {allMonths.map(m => (
                  <option key={m} value={m}>{formatMonth(m)}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <SummaryCard icon={<DollarSign size={16} className="text-green-600" />} label="Total Payout" value={fmt(grandTotal)} bg="bg-green-50" />
            <SummaryCard icon={<CheckCircle2 size={16} className="text-blue-600" />} label="Verified Jobs" value={String(filteredJobs.length)} bg="bg-blue-50" />
            <SummaryCard icon={<Users size={16} className="text-purple-600" />} label="Staff Earning" value={String(staffEntries.filter(e => e.name !== 'Unassigned').length)} bg="bg-purple-50" />
          </div>

          {/* No data */}
          {staffEntries.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No verified jobs found for this period.</p>
            </div>
          )}

          {/* Per-staff sections */}
          {staffEntries.map(entry => {
            const expanded = expandedStaff.has(entry.name)
            const sectionId = `staff-section-${entry.name.replace(/\s/g, '-')}`
            return (
              <div key={entry.name} id={sectionId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Staff header row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900">{entry.name}</p>
                      <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                        {entry.role.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{entry.jobs.length} job{entry.jobs.length !== 1 ? 's' : ''}</p>
                  </div>
                  <p className="text-base font-bold text-green-600 shrink-0">{fmt(entry.total)}</p>
                  <button
                    onClick={() => toggleExpand(entry.name)}
                    className="no-print p-1.5 rounded-lg hover:bg-gray-100 shrink-0"
                  >
                    {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                </div>

                {/* Job detail rows */}
                <div className={`staff-jobs border-t border-gray-50 ${expanded ? 'block' : 'hidden'}`}>
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500">
                    <span>Job No</span>
                    <span>Customer</span>
                    <span>Date</span>
                    <span className="text-right">Comm</span>
                  </div>
                  {entry.jobs.map(({ job, amount }) => (
                    <div key={job.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 px-4 py-2.5 border-t border-gray-50 items-center">
                      <p className="text-xs font-semibold text-blue-700">{job.jobNumber}</p>
                      <p className="text-xs text-gray-700 truncate">{job.customer.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(job.createdAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-xs font-semibold text-green-700 text-right">{fmt(amount)}</p>
                    </div>
                  ))}
                  {/* Subtotal */}
                  <div className="flex justify-between px-4 py-2.5 border-t border-gray-200 bg-green-50">
                    <span className="text-xs font-bold text-gray-700">Subtotal</span>
                    <span className="text-xs font-bold text-green-700">{fmt(entry.total)}</span>
                  </div>
                  {/* Print this staff */}
                  <div className="px-4 py-2.5 border-t border-gray-100 no-print">
                    <button
                      onClick={() => handlePrintStaff(entry.name)}
                      className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline"
                    >
                      <Printer size={13} /> Print {entry.name}&apos;s Report
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Grand total */}
          {staffEntries.length > 0 && (
            <div className="bg-gray-900 rounded-2xl px-4 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">Grand Total Payout</p>
                <p className="text-xs text-gray-500 mt-0.5">{selectedMonth === 'all' ? 'All Time' : formatMonth(selectedMonth)}</p>
              </div>
              <p className="text-2xl font-bold text-white">{fmt(grandTotal)}</p>
            </div>
          )}

          {/* Summary table for print */}
          <div className="hidden print-always mt-6">
            <h2 className="text-base font-bold mb-2">Summary by Staff</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Staff</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600 }}>Jobs</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Commission</th>
                </tr>
              </thead>
              <tbody>
                {staffEntries.map(e => (
                  <tr key={e.name} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px 12px' }}>{e.name}</td>
                    <td style={{ padding: '8px 12px', textTransform: 'capitalize' }}>{e.role.replace('_', ' ')}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>{e.jobs.length}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{fmt(e.total)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid #999', background: '#f9f9f9', fontWeight: 700 }}>
                  <td colSpan={3} style={{ padding: '8px 12px' }}>Grand Total</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </>
  )
}

function SummaryCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <div className={`${bg} rounded-2xl p-3`}>
      <div className="mb-1">{icon}</div>
      <p className="text-base font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-xs text-gray-500 font-medium leading-tight mt-0.5">{label}</p>
    </div>
  )
}
