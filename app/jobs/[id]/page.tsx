'use client'

import { use, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { mockJobs } from '@/lib/mock-data'
import StatusBadge from '@/components/StatusBadge'
import PhotoUpload from '@/components/PhotoUpload'
import Timeline from '@/components/Timeline'
import { WorkResult, JobStatus } from '@/types'
import {
  ArrowLeft, User, Phone, MapPin, Package, ShieldCheck,
  CheckCircle2, XCircle, RotateCcw, ChevronDown,
} from 'lucide-react'

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

  const job = mockJobs.find(j => j.id === id)
  if (!job) notFound()

  const [workResult, setWorkResult] = useState<WorkResult | ''>(job.workResult ?? '')
  const [remarks, setRemarks] = useState(job.remarks ?? '')
  const [photos, setPhotos] = useState(job.photos)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [verifyStatus, setVerifyStatus] = useState(job.verifyStatus)

  function handleSave() {
    setSaving(true)
    setTimeout(() => setSaving(false), 1200)
  }

  function handleSubmit() {
    setSubmitting(true)
    setTimeout(() => setSubmitting(false), 1500)
  }

  function handleVerify() {
    setVerifyStatus('verified')
  }

  function handleReject() {
    setVerifyStatus('rejected')
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
        {job.assignedStaff && (
          <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
            <User size={15} className="text-blue-500 shrink-0" />
            <span className="text-sm font-medium text-blue-700">{job.assignedStaff}</span>
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
              {verifyStatus === 'verified' ? 'Verified' : verifyStatus === 'rejected' ? 'Rejected' : 'Pending Verification'}
            </span>
          </div>

          {verifyStatus === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={handleVerify}
                className="flex-1 h-11 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all"
              >
                Verify Work
              </button>
              <button
                onClick={handleReject}
                className="flex-1 h-11 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-semibold hover:bg-red-100 active:scale-95 transition-all"
              >
                Request Revisit
              </button>
            </div>
          )}
        </Section>

        {/* 7. Timeline */}
        <Section title="Activity Timeline">
          <Timeline events={job.timeline} />
        </Section>
      </div>

      {/* 8. Sticky Bottom Action Bar */}
      <div className="sticky bottom-20 bg-white border-t border-gray-100 px-4 py-3 flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Progress'}
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit for Verify'}
        </button>
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
