'use client'

import { useState } from 'react'
import { useJobsStore } from '@/lib/jobs-store'
import JobCard from '@/components/JobCard'
import { Job, JobStatus } from '@/types'
import { Search } from 'lucide-react'

type FilterTab = 'all' | 'pending' | 'ongoing' | 'waiting_verify' | 'completed'

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'ongoing', label: 'On Going' },
  { key: 'waiting_verify', label: 'Verify' },
  { key: 'completed', label: 'Done' },
]

function matchesFilter(job: Job, filter: FilterTab): boolean {
  if (filter === 'all') return true
  if (filter === 'pending') return job.status === 'pending' || job.status === 'assigned'
  if (filter === 'ongoing') return job.status === 'ongoing'
  if (filter === 'waiting_verify') return job.status === 'waiting_verify'
  if (filter === 'completed') return job.status === 'completed' || job.status === 'verified'
  return false
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="h-5 w-36 bg-gray-200 rounded mb-1" />
      <div className="h-4 w-48 bg-gray-200 rounded mb-3" />
      <div className="flex gap-4">
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

export default function JobsPage() {
  const jobs = useJobsStore(s => s.jobs)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const filtered = jobs.filter(job => {
    const matchSearch = !search ||
      job.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      job.jobNumber.toLowerCase().includes(search.toLowerCase()) ||
      job.product.toLowerCase().includes(search.toLowerCase())
    return matchSearch && matchesFilter(job, activeTab)
  })

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Jobs</h1>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer, job number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Job Count */}
      <p className="text-xs text-gray-400 mb-3">{filtered.length} job{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Job List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No jobs found</p>
          </div>
        ) : (
          filtered.map(job => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  )
}
