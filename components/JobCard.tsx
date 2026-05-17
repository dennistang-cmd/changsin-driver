import Link from 'next/link'
import { Job } from '@/types'
import StatusBadge from './StatusBadge'
import { MapPin, User, Calendar } from 'lucide-react'

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`} className="block">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:scale-[0.98] hover:shadow-md transition-all duration-150">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{job.jobNumber}</span>
            <span className="ml-2 text-xs text-gray-400">{job.type}</span>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <p className="font-semibold text-gray-900 mb-1">{job.customer.name}</p>
        <p className="text-sm text-gray-500 mb-3">{job.product}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
          {job.assignedStaff && (
            <span className="flex items-center gap-1">
              <User size={12} />
              {job.assignedStaff}
            </span>
          )}
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {job.customer.address.split(',').slice(-1)[0].trim()}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(job.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  )
}
