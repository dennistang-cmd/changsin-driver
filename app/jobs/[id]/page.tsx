'use client'

import { use, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { useJobsStore } from '@/lib/jobs-store'
import StatusBadge from '@/components/StatusBadge'
import PhotoUpload from '@/components/PhotoUpload'
import Timeline from '@/components/Timeline'
import { WorkResult, JobStatus } from '@/types'
import {
  ArrowLeft, User, Phone, MapPin, Package, ShieldCheck,
  CheckCircle2, XCircle, RotateCcw, ChevronDown, Check, Plus,
} from 'lucide-react'
import { useStaffStore } from '@/lib/staff-store'

function mapWorkResultToStatus(result: WorkResult | ''): JobStatus {
  if (!result || result === 'completed') return 'ongoing'
  return result as JobStatus
}

const workResultOptions: { value: WorkResult; label: string }[] = [
  { value: 'completed', label: 'Completed' },
  { value: 'pending_parts', label: 'Pending Parts' },
  { value: 'product_defect', label: 'Product Defect' },
  { value: 'warranty_claim', label: 'Warranty Claim' },
  { value: 'need_revisit', label: 'Need Revisit' },
  { value: 'customer_no_show', label: 'Customer No Show' },
]

const remarksPlaceholders = [
  'e.g. Missing remote control',
  'e.g. Need to order spare parts — drain pump',
  'e.g. Product cannot power on after reset',
  'e.g. Customer requested revisit next week',
]

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const jobs = useJobsStore(s => s.jobs)

  const job = jobs.find(j => j.id === id)
  if (!job) return notFound()

  const [workResult, setWorkResult] = useState<WorkResult | ''>(job.workResult ?? '')
  const [remarks, setRemarks] = useState(job.remarks ?? '')
  const [photos, setPhotos] = useState(job.photos)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [verifyStatus, setVerifyStatus] = useState(job.verifyStatus)
  const [commissionInput, setCommissionInput] = useState(
    job.commissionAmount !== undefined ? String(job.commissionAmount) : ''
  )
  const [commissionError, setCommissionError] = useState(false)
  const [showRevisitModal, setShowRevisitModal] = useState(false)
  const [revisitStaff, setRevisitStaff] = useState('')
  const [revisitNotes, setRevisitNotes] = useState('')
  const [revisitCreated, setRevisitCreated] = useState<{ id: string; jobNumber: string } | null>(null)
  const updateJob = useJobsStore(s => s.updateJob)
  const addJob = useJobsStore(s => s.addJob)
  const allStaff = useStaffStore(s => s.staff)
  const fieldStaff = allStaff.filter(s => s.isActive && s.role !== 'boss' && s.role !== 'secretary')

  async function handleSave() {
    setSaving(true)
    await updateJob(id, {
      photos,
      workResult: workResult || undefined,
      remarks,
      status: mapWorkResultToStatus(workResult),
      timelineLabel: 'Progress Saved',
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSubmitForVerify() {
    setSubmitting(true)
    await updateJob(id, {
      photos,
      workResult: workResult || undefined,
      remarks,
      status: 'waiting_verify',
      timelineLabel: 'Submitted For Verification',
    })
    setSubmitting(false)
  }

  async function handleVerify() {
    const amount = parseFloat(commissionInput)
    if (commissionInput.trim() === '' || isNaN(amount) || amount < 0) {
      setCommissionError(true)
      return
    }
    setCommissionError(false)
    setVerifyStatus('verified')
    await updateJob(id, {
      verifyStatus: 'verified',
      status: 'verified',
      commissionAmount: amount,
      timelineLabel: `Work Verified · Commission RM${amount.toFixed(2)}`,
    })
  }

  function handleRequestRevisit() {
    setShowRevisitModal(true)
  }

  async function handleConfirmRevisit() {
    const staffName = fieldStaff.find(s => s.id === revisitStaff)?.name
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const j = job!
    const newJob = await addJob({
      type: j.type,
      customerName: j.customer.name,
      phone: j.customer.phone,
      address: j.customer.address,
      jobNumber: '',
      product: j.product,
      notes: revisitNotes || `Revisit from ${j.jobNumber}`,
      assignedStaff: staffName ? [staffName] : undefined,
    })
    await updateJob(id, {
      verifyStatus: 'rejected',
      status: 'need_revisit',
      timelineLabel: `Revisit Requested · New Job ${newJob.jobNumber}`,
    })
    setVerifyStatus('rejected')
    setShowRevisitModal(false)
    setRevisitCreated({ id: newJob.id, jobNumber: newJob.jobNumber })
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-900 truncate">{job.jobNumber}</h1>
          <p className="text-xs text-gray-400">{job.type} · {new Date(job.createdAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="flex-1 px-4 py-4 flex flex-col gap-4">

        {/* 1. Assigned Staff */}
        {job.assignedStaff && job.assignedStaff.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.assignedStaff.map(name => (
              <div key={name} className="flex items-center gap-1.5 bg-blue-50 rounded-xl px-3 py-2">
                <User size={14} className="text-blue-500 shrink-0" />
                <span className="text-sm font-medium text-blue-700">{name}</span>
              </div>
            ))}
          </div>
        )}

        {/* 2. Customer Info */}
        <Section title="Customer Info">
          <InfoRow icon={<User size={14} />} label={job.customer.name} />
          <InfoRow icon={<Phone size={14} />} label={job.customer.phone} />
          <InfoRow icon={<MapPin size={14} />} label={job.customer.address} />
          <InfoRow icon={<Package size={14} />} label={job.product} />
          <div className="flex items-center gap-2 mt-1">
            <ShieldCheck size={14} className={job.warrantyActive ? 'text-green-500' : 'text-gray-300'} />
            <span className={`text-xs font-medium ${job.warrantyActive ? 'text-green-600' : 'text-gray-400'}`}>
              {job.warrantyActive ? 'Warranty Active' : 'No Warranty'}
            </span>
          </div>
        </Section>

        {/* 3. Work Evidence Photos */}
        <Section title="Work Evidence Photos">
          <div className="grid grid-cols-2 gap-3">
            <PhotoUpload
              label="Before Installation"
              value={photos.before}
              onChange={v => setPhotos(p => ({ ...p, before: v }))}
            />
            <PhotoUpload
              label="After Installation"
              value={photos.after}
              onChange={v => setPhotos(p => ({ ...p, after: v }))}
            />
            <PhotoUpload
              label="Problem Photo"
              value={photos.problem}
              onChange={v => setPhotos(p => ({ ...p, problem: v }))}
            />
            <PhotoUpload
              label="Warranty Photo"
              value={photos.warranty}
              onChange={v => setPhotos(p => ({ ...p, warranty: v }))}
            />
          </div>
        </Section>

        {/* 4. Work Result */}
        <Section title="Work Result">
          <div className="relative">
            <select
              value={workResult}
              onChange={e => setWorkResult(e.target.value as WorkResult)}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select result...</option>
              {workResultOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </Section>

        {/* 5. Remarks */}
        <Section title="Remarks">
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={3}
            placeholder={remarksPlaceholders[0]}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Section>

        {/* 6. Verification */}
        <Section title="Verification">
          {/* Status badge */}
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 mb-3 ${
            verifyStatus === 'verified' ? 'bg-green-50' :
            verifyStatus === 'rejected' ? 'bg-red-50' : 'bg-gray-50'
          }`}>
            {verifyStatus === 'verified' ? (
              <CheckCircle2 size={16} className="text-green-500" />
            ) : verifyStatus === 'rejected' ? (
              <XCircle size={16} className="text-red-500" />
            ) : (
              <RotateCcw size={16} className="text-gray-400" />
            )}
            <span className={`text-sm font-semibold ${
              verifyStatus === 'verified' ? 'text-green-700' :
              verifyStatus === 'rejected' ? 'text-red-700' : 'text-gray-500'
            }`}>
              {verifyStatus === 'verified'
                ? `Verified · Commission RM${job.commissionAmount?.toFixed(2) ?? commissionInput}`
                : verifyStatus === 'rejected' ? 'Revisit Requested'
                : 'Pending Verification'}
            </span>
          </div>

          {/* Revisit created notice */}
          {revisitCreated && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 mb-3">
              <Plus size={14} className="text-blue-500 shrink-0" />
              <p className="text-xs text-blue-700">New revisit job created: <span className="font-semibold">{revisitCreated.jobNumber}</span></p>
              <button
                onClick={() => router.push(`/jobs/${revisitCreated.id}`)}
                className="ml-auto text-xs text-blue-600 font-semibold underline"
              >
                View
              </button>
            </div>
          )}

          {verifyStatus === 'pending' && (
            <div className="flex flex-col gap-3">
              {/* Commission input */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Commission Amount (RM) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">RM</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={commissionInput}
                    onChange={e => { setCommissionInput(e.target.value); setCommissionError(false) }}
                    className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      commissionError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                </div>
                {commissionError && (
                  <p className="text-xs text-red-500 mt-1">Please enter commission amount (RM 0 if none)</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleVerify}
                  className="flex-1 h-11 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all"
                >
                  Verify Work
                </button>
                <button
                  onClick={handleRequestRevisit}
                  className="flex-1 h-11 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-semibold hover:bg-red-100 active:scale-95 transition-all"
                >
                  Request Revisit
                </button>
              </div>
            </div>
          )}
        </Section>

        {/* 7. Timeline */}
        <Section title="Activity Timeline">
          <Timeline events={job.timeline} />
        </Section>
      </div>

      {/* Revisit Modal */}
      {showRevisitModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded-t-3xl px-5 pt-6 pb-8 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Request Revisit</h3>
              <p className="text-xs text-gray-400 mt-0.5">A new job will be created with the same customer details.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Assign to Staff <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={revisitStaff}
                  onChange={e => setRevisitStaff(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-10 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Unassigned —</option>
                  {fieldStaff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Revisit Notes <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea
                rows={2}
                placeholder={`e.g. Revisit from ${job.jobNumber} — customer issue unresolved`}
                value={revisitNotes}
                onChange={e => setRevisitNotes(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowRevisitModal(false)}
                className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevisit}
                className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:scale-95 transition-all"
              >
                Create Revisit Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Sticky Bottom Action Bar */}
      <div className="sticky bottom-20 bg-white border-t border-gray-100 px-4 py-3 flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`h-11 rounded-xl border text-sm font-semibold active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 ${
            workResult === 'completed' ? 'flex-none px-5 border-gray-200 text-gray-700 hover:bg-gray-50' : 'flex-1 border-gray-200 text-gray-700 hover:bg-gray-50'
          } ${saved ? 'border-green-300 text-green-700 bg-green-50' : ''}`}
        >
          {saved ? <><Check size={15} /> Saved</> : saving ? 'Saving...' : 'Save Progress'}
        </button>
        {workResult === 'completed' && (
          <button
            onClick={handleSubmitForVerify}
            disabled={submitting}
            className="flex-1 h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit for Verify'}
          </button>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">{title}</h2>
      {children}
    </div>
  )
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-start gap-2 mb-2 last:mb-0">
      <span className="mt-0.5 text-gray-400 shrink-0">{icon}</span>
      <span className="text-sm text-gray-700 leading-snug">{label}</span>
    </div>
  )
}
