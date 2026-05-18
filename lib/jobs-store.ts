'use client'

import { create } from 'zustand'
import { Job, JobType, JobStatus, WorkResult, VerifyStatus } from '@/types'
import { supabase } from './supabase'
import { mockStaff } from './mock-data'

export { mockStaff }

// ─── DB row types ──────────────────────────────────────────────────────────────

type DbJob = {
  id: string; job_number: string; type: string
  customer_name: string; customer_phone: string; customer_address: string
  product: string; assigned_staff: string[]; status: string
  work_result: string | null; remarks: string | null
  photo_before: string | null; photo_after: string | null
  photo_problem: string | null; photo_warranty: string | null
  created_at: string; verify_status: string
  warranty_active: boolean; commission_amount: number
}

type DbTimeline = { id: string; job_id: string; label: string; ts: string; actor: string }

// ─── Converters ───────────────────────────────────────────────────────────────

function dbToJob(row: DbJob, timeline: DbTimeline[]): Job {
  return {
    id: row.id,
    jobNumber: row.job_number,
    type: row.type as JobType,
    customer: { name: row.customer_name, phone: row.customer_phone, address: row.customer_address },
    product: row.product,
    assignedStaff: row.assigned_staff?.length ? row.assigned_staff : undefined,
    status: row.status as JobStatus,
    workResult: (row.work_result ?? undefined) as WorkResult | undefined,
    remarks: row.remarks ?? undefined,
    photos: {
      before: row.photo_before ?? undefined,
      after: row.photo_after ?? undefined,
      problem: row.photo_problem ?? undefined,
      warranty: row.photo_warranty ?? undefined,
    },
    timeline: [...timeline]
      .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
      .map(t => ({ id: t.id, label: t.label, timestamp: t.ts, actor: t.actor })),
    createdAt: row.created_at,
    verifyStatus: row.verify_status as VerifyStatus,
    warrantyActive: row.warranty_active,
    commissionAmount: Number(row.commission_amount),
  }
}

// ─── ID generator ─────────────────────────────────────────────────────────────

function generateJobId(type: JobType): { id: string; jobNumber: string } {
  const rand = Math.floor(10000 + Math.random() * 90000)
  switch (type) {
    case 'DO':           return { id: `do-${rand}`,  jobNumber: `DO-${rand}` }
    case 'JO':           return { id: `jo-${rand}`,  jobNumber: `JO-${rand}` }
    case 'Repair':       return { id: `rep-${rand}`, jobNumber: `REP-${rand}` }
    case 'Installation': return { id: `ins-${rand}`, jobNumber: `INS-${rand}` }
    default: {
      const prefix = type.slice(0, 3).toUpperCase()
      return { id: `${prefix.toLowerCase()}-${rand}`, jobNumber: `${prefix}-${rand}` }
    }
  }
}

// ─── Input types ──────────────────────────────────────────────────────────────

type NewJobInput = {
  type: JobType; customerName: string; phone: string; address: string
  jobNumber: string; product: string; notes: string
  assignedStaff?: string[]; photo?: string
}

type UpdateJobInput = {
  photos?: Job['photos']; workResult?: Job['workResult']
  remarks?: string; status?: JobStatus
  verifyStatus?: Job['verifyStatus']; timelineLabel?: string
  commissionAmount?: number
}

type JobsStore = {
  jobs: Job[]
  isLoading: boolean
  loadJobs: () => Promise<void>
  addJob: (input: NewJobInput) => Promise<Job>
  updateJob: (id: string, update: UpdateJobInput) => Promise<void>
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useJobsStore = create<JobsStore>()((set, get) => ({
  jobs: [],
  isLoading: true,

  loadJobs: async () => {
    set({ isLoading: true })
    const { data: rows, error } = await supabase
      .from('cs_jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !rows) { set({ isLoading: false }); return }

    const { data: timelines } = await supabase
      .from('cs_job_timeline')
      .select('*')

    const timelineMap = new Map<string, DbTimeline[]>()
    ;(timelines ?? []).forEach(t => {
      if (!timelineMap.has(t.job_id)) timelineMap.set(t.job_id, [])
      timelineMap.get(t.job_id)!.push(t)
    })

    const jobs = (rows as DbJob[]).map(r => dbToJob(r, timelineMap.get(r.id) ?? []))
    set({ jobs, isLoading: false })
  },

  addJob: async (input) => {
    const { id, jobNumber } = input.jobNumber
      ? { id: input.jobNumber.toLowerCase().replace(/\s+/g, '-'), jobNumber: input.jobNumber }
      : generateJobId(input.type)

    const now = new Date().toISOString()

    const timeline: DbTimeline[] = [
      { id: `t-${Date.now()}-1`, job_id: id, label: 'Job Created', ts: now, actor: 'Admin' },
      ...(input.assignedStaff?.length ? [{
        id: `t-${Date.now()}-2`, job_id: id,
        label: `Assigned to ${input.assignedStaff.join(', ')}`, ts: now, actor: 'Admin',
      }] : []),
    ]

    const row = {
      id, job_number: jobNumber, type: input.type,
      customer_name: input.customerName, customer_phone: input.phone, customer_address: input.address,
      product: input.product,
      assigned_staff: input.assignedStaff ?? [],
      status: (input.assignedStaff?.length ? 'assigned' : 'pending') as JobStatus,
      remarks: input.notes,
      photo_before: input.photo ?? null,
      created_at: now, verify_status: 'pending',
      warranty_active: false, commission_amount: 0,
    }

    await supabase.from('cs_jobs').insert(row)
    await supabase.from('cs_job_timeline').insert(timeline)

    const job = dbToJob(row as DbJob, timeline)
    set(s => ({ jobs: [job, ...s.jobs] }))
    return job
  },

  updateJob: async (id, update) => {
    const patch: Partial<DbJob> = {}
    if (update.photos !== undefined) {
      if (update.photos.before  !== undefined) patch.photo_before  = update.photos.before  ?? null
      if (update.photos.after   !== undefined) patch.photo_after   = update.photos.after   ?? null
      if (update.photos.problem !== undefined) patch.photo_problem = update.photos.problem ?? null
      if (update.photos.warranty !== undefined) patch.photo_warranty = update.photos.warranty ?? null
    }
    if (update.workResult  !== undefined) patch.work_result  = update.workResult  ?? null
    if (update.remarks     !== undefined) patch.remarks       = update.remarks
    if (update.status      !== undefined) patch.status        = update.status
    if (update.verifyStatus !== undefined) patch.verify_status = update.verifyStatus
    if (update.commissionAmount !== undefined) patch.commission_amount = update.commissionAmount

    if (Object.keys(patch).length > 0) {
      await supabase.from('cs_jobs').update(patch).eq('id', id)
    }

    if (update.timelineLabel) {
      const entry = { id: `t-${Date.now()}`, job_id: id, label: update.timelineLabel, ts: new Date().toISOString(), actor: 'Staff' }
      await supabase.from('cs_job_timeline').insert(entry)
    }

    // Reload just this job from DB so state is authoritative
    const { data: row } = await supabase.from('cs_jobs').select('*').eq('id', id).single()
    const { data: tl } = await supabase.from('cs_job_timeline').select('*').eq('job_id', id)
    if (row) {
      const updated = dbToJob(row as DbJob, (tl ?? []) as DbTimeline[])
      set(s => ({ jobs: s.jobs.map(j => j.id === id ? updated : j) }))
    }
  },
}))
