import Link from 'next/link'
import { mockJobs, mockStaff } from '@/lib/mock-data'
import StatusBadge from '@/components/StatusBadge'
import { Zap, Clock, Wrench, CheckCircle, Package, ChevronRight, User } from 'lucide-react'

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })
}

export default function DashboardPage() {
  const total = mockJobs.length
  const pending = mockJobs.filter(j => j.status === 'pending' || j.status === 'assigned').length
  const ongoing = mockJobs.filter(j => j.status === 'ongoing').length
  const completed = mockJobs.filter(j => j.status === 'completed' || j.status === 'verified').length
  const pendingParts = mockJobs.filter(j => j.status === 'pending_parts').length
  const recentJobs = [...mockJobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Chang Sin</h1>
          <p className="text-sm text-gray-400">Today, {new Date().toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <Zap size={18} className="text-white" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Total Jobs" value={total} icon={<Zap size={18} className="text-blue-500" />} bg="bg-blue-50" />
        <StatCard label="Pending" value={pending} icon={<Clock size={18} className="text-amber-500" />} bg="bg-amber-50" />
        <StatCard label="On Going" value={ongoing} icon={<Wrench size={18} className="text-indigo-500" />} bg="bg-indigo-50" />
        <StatCard label="Completed" value={completed} icon={<CheckCircle size={18} className="text-emerald-500" />} bg="bg-emerald-50" />
      </div>

      {pendingParts > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-6">
          <Package size={18} className="text-yellow-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">{pendingParts} job{pendingParts > 1 ? 's' : ''} awaiting parts</p>
            <p className="text-xs text-yellow-600">Action required</p>
          </div>
          <Link href="/jobs" className="text-xs text-yellow-700 font-medium">View →</Link>
        </div>
      )}

      {/* Staff Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Staff Activity</h2>
          <Link href="/staff" className="text-xs text-blue-600 font-medium">Manage</Link>
        </div>
        <div className="flex flex-col gap-2">
          {mockStaff.filter(s => s.role !== 'boss' && s.role !== 'secretary').map(staff => (
            <div key={staff.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <User size={14} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{staff.name}</p>
                <p className="text-xs text-gray-400 capitalize">{staff.role}</p>
              </div>
              <div className="text-right">
                <div className="w-2 h-2 rounded-full bg-green-400 inline-block mr-1" />
                <span className="text-xs text-gray-400">{staff.lastActive ? formatTime(staff.lastActive) : '—'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Recent Jobs</h2>
          <Link href="/jobs" className="text-xs text-blue-600 font-medium">See all</Link>
        </div>
        <div className="flex flex-col gap-2">
          {recentJobs.map(job => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 active:opacity-70">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{job.jobNumber}</p>
                <p className="text-xs text-gray-400 truncate">{job.customer.name} · {job.product}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <StatusBadge status={job.status} />
                <span className="text-xs text-gray-400">{formatDate(job.createdAt)}</span>
              </div>
              <ChevronRight size={14} className="text-gray-300 shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, bg }: { label: string; value: number; icon: React.ReactNode; bg: string }) {
  return (
    <div className={`${bg} rounded-2xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  )
}
