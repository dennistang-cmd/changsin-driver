'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Job, JobType, JobStatus } from '@/types'
import { mockJobs, mockStaff } from './mock-data'

export { mockStaff }

function generateJobId(type: JobType): { id: string; jobNumber: string } {
  const rand = Math.floor(10000 + Math.random() * 90000)
  switch (type) {
    case 'DO':          return { id: `do-${rand}`,  jobNumber: `DO-${rand}` }
    case 'JO':          return { id: `jo-${rand}`,  jobNumber: `JO-${rand}` }
    case 'Repair':      return { id: `rep-${rand}`, jobNumber: `REP-${rand}` }
    case 'Installation':return { id: `ins-${rand}`, jobNumber: `INS-${rand}` }
    default: {
      const prefix = type.slice(0, 3).toUpperCase()
      return { id: `${prefix.toLowerCase()}-${rand}`, jobNumber: `${prefix}-${rand}` }
    }
  }
}

type NewJobInput = {
  type: JobType
  customerName: string
  phone: string
  address: string
  jobNumber: string
  product: string
  notes: string
  assignedStaff?: string[]
  photo?: string
}

type UpdateJobInput = {
  photos?: Job['photos']
  workResult?: Job['workResult']
  remarks?: string
  status?: JobStatus
  verifyStatus?: Job['verifyStatus']
  timelineLabel?: string
  commissionAmount?: number
}

type JobsStore = {
  jobs: Job[]
  addJob: (input: NewJobInput) => Job
  updateJob: (id: string, update: UpdateJobInput) => void
}

export const useJobsStore = create<JobsStore>()(
  persist(
    (set, get) => ({
      jobs: mockJobs,

      updateJob: (id, update) => {
        set(s => ({
          jobs: s.jobs.map(j => {
            if (j.id !== id) return j
            const newTimeline = update.timelineLabel
              ? [...j.timeline, { id: `t${Date.now()}`, label: update.timelineLabel, timestamp: new Date().toISOString(), actor: 'Staff' }]
              : j.timeline
            return {
              ...j,
              ...(update.photos      !== undefined && { photos: update.photos }),
              ...(update.workResult  !== undefined && { workResult: update.workResult }),
              ...(update.remarks     !== undefined && { remarks: update.remarks }),
              ...(update.status      !== undefined && { status: update.status }),
              ...(update.verifyStatus    !== undefined && { verifyStatus: update.verifyStatus }),
              ...(update.commissionAmount !== undefined && { commissionAmount: update.commissionAmount }),
              timeline: newTimeline,
            }
          }),
        }))
      },

      addJob: (input) => {
        const { id, jobNumber } = input.jobNumber
          ? { id: input.jobNumber.toLowerCase().replace(/\s+/g, '-'), jobNumber: input.jobNumber }
          : generateJobId(input.type)

        const job: Job = {
          id,
          jobNumber,
          type: input.type,
          customer: {
            name: input.customerName,
            phone: input.phone,
            address: input.address,
          },
          product: input.product,
          assignedStaff: input.assignedStaff?.length ? input.assignedStaff : undefined,
          status: (input.assignedStaff?.length ? 'assigned' : 'pending') as JobStatus,
          workResult: undefined,
          remarks: input.notes,
          photos: input.photo ? { before: input.photo } : {},
          timeline: [
            {
              id: 't1',
              label: 'Job Created',
              timestamp: new Date().toISOString(),
              actor: 'Admin',
            },
            ...(input.assignedStaff?.length ? [{
              id: 't2',
              label: `Assigned to ${input.assignedStaff.join(', ')}`,
              timestamp: new Date().toISOString(),
              actor: 'Admin',
            }] : []),
          ],
          createdAt: new Date().toISOString(),
          verifyStatus: 'pending',
          warrantyActive: false,
          commissionAmount: 0,
        }

        set(s => ({ jobs: [job, ...s.jobs] }))
        return job
      },
    }),
    {
      name: 'changsin-jobs',
      skipHydration: true,
      version: 1,
      migrate: (persisted: unknown) => {
        const state = persisted as { jobs?: Job[] }
        if (state?.jobs) {
          state.jobs = state.jobs.map(j => ({
            ...j,
            assignedStaff: j.assignedStaff == null
              ? undefined
              : Array.isArray(j.assignedStaff)
                ? j.assignedStaff
                : [j.assignedStaff as unknown as string],
          }))
        }
        return state
      },
    }
  )
)
