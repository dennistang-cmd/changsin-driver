'use client'

import { useState, useRef } from 'react'
import { Camera, X, CheckCircle2, Loader2, AlertTriangle, Sparkles, User } from 'lucide-react'
import { useJobsStore } from '@/lib/jobs-store'
import { useStaffStore } from '@/lib/staff-store'
import { useSettingsStore } from '@/lib/settings-store'
import Link from 'next/link'

type FormState = {
  customerName: string
  phone: string
  address: string
  jobNumber: string
  product: string
  notes: string
}

const emptyForm: FormState = {
  customerName: '', phone: '', address: '', jobNumber: '', product: '', notes: '',
}

export default function UploadPage() {
  const addJob = useJobsStore(s => s.addJob)
  const allStaff = useStaffStore(s => s.staff)
  const activeStaff = allStaff.filter(s => s.isActive)
  const jobTypeSettings = useSettingsStore(s => s.jobTypes)
  const activeJobTypes = jobTypeSettings.filter(jt => jt.active)

  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [jobType, setJobType] = useState<string>(activeJobTypes[0]?.code ?? 'DO')
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])

  // Staff shown = active staff whose role is allowed for the currently selected job type
  const currentJobTypeSetting = activeJobTypes.find(jt => jt.code === jobType)
  const visibleStaff = activeStaff.filter(s =>
    currentJobTypeSetting?.allowedRoles.includes(s.role) ?? true
  )

  // Job types visible = types where at least one selected staff's role is allowed (bidirectional)
  const selectedRoles = selectedStaff.map(id => activeStaff.find(s => s.id === id)?.role).filter(Boolean) as string[]
  const visibleJobTypes = activeJobTypes.filter(jt =>
    selectedRoles.length === 0 || selectedRoles.some(r => jt.allowedRoles.includes(r))
  )
  const [form, setForm] = useState<FormState>(emptyForm)
  const [scanning, setScanning] = useState(false)
  const [ocrError, setOcrError] = useState('')
  const [autoFilled, setAutoFilled] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [submittedJob, setSubmittedJob] = useState<{ id: string; jobNumber: string } | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  function toggleStaff(id: string) {
    setSelectedStaff(prev => {
      const next = prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
      const nextRoles = next.map(sid => activeStaff.find(s => s.id === sid)?.role).filter(Boolean) as string[]
      const nextVisible = activeJobTypes.filter(jt =>
        nextRoles.length === 0 || nextRoles.some(r => jt.allowedRoles.includes(r))
      )
      if (nextVisible.length > 0 && !nextVisible.find(jt => jt.code === jobType)) {
        setJobType(nextVisible[0].code)
      }
      return next
    })
  }

  async function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const result = reader.result as string
      setCapturedImage(result)
      setOcrError('')
      setAutoFilled(new Set())

      setScanning(true)
      try {
        const res = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: result }),
        })
        const json = await res.json()
        if (json.data) {
          const filled = new Set<string>()
          const d = json.data
          setForm(f => {
            const next = { ...f }
            if (d.customerName) { next.customerName = d.customerName; filled.add('customerName') }
            if (d.phone)         { next.phone = d.phone;               filled.add('phone') }
            if (d.address)       { next.address = d.address;           filled.add('address') }
            if (d.jobNumber)     { next.jobNumber = d.jobNumber;       filled.add('jobNumber') }
            if (d.product)       { next.product = d.product;           filled.add('product') }
            if (d.notes)         { next.notes = d.notes;               filled.add('notes') }
            return next
          })
          if (d.jobType && activeJobTypes.some(jt => jt.code === d.jobType)) {
            setJobType(d.jobType)
          }
          setAutoFilled(filled)
        } else {
          setOcrError('Could not read document. Please fill in manually.')
        }
      } catch {
        setOcrError('Scan failed. Please fill in manually.')
      } finally {
        setScanning(false)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleRetake() {
    setCapturedImage(null)
    setOcrError('')
    setAutoFilled(new Set())
    setForm(emptyForm)
    if (cameraRef.current) cameraRef.current.value = ''
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const staffNames = selectedStaff
      .map(id => activeStaff.find(s => s.id === id)?.name)
      .filter(Boolean) as string[]

    const job = addJob({
      type: jobType,
      customerName: form.customerName,
      phone: form.phone,
      address: form.address,
      jobNumber: form.jobNumber,
      product: form.product,
      notes: form.notes,
      assignedStaff: staffNames.length ? staffNames : undefined,
      photo: capturedImage ?? undefined,
    })

    setTimeout(() => {
      setSubmitting(false)
      setSubmittedJob({ id: job.id, jobNumber: job.jobNumber })
    }, 600)
  }

  function handleUploadAnother() {
    setSubmittedJob(null)
    setCapturedImage(null)
    setForm(emptyForm)
    setAutoFilled(new Set())
    setSelectedStaff([])
    setJobType(activeJobTypes[0]?.code ?? 'DO')
  }

  if (submittedJob) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Job Submitted!</h2>
        <p className="text-sm text-gray-500 mb-1">The job has been created successfully.</p>
        <p className="text-xs font-semibold text-blue-600 mb-8">{submittedJob.jobNumber}</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href={`/jobs/${submittedJob.id}`}
            className="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center"
          >
            View Job
          </Link>
          <button
            onClick={handleUploadAnother}
            className="w-full h-11 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all"
          >
            Upload Another Job
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 pt-6 pb-4 flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Upload Job</h1>
        <p className="text-xs text-gray-400 mt-0.5">Take a photo — fields will fill automatically</p>
      </div>

      {/* Camera / Photo */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">DO / JO Photo</label>
        {capturedImage ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            {scanning && (
              <div className="absolute inset-0 bg-blue-900/60 flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="text-white animate-spin" />
                <p className="text-white text-sm font-semibold">Scanning document...</p>
              </div>
            )}
            {!scanning && (
              <button
                type="button"
                onClick={handleRetake}
                className="absolute top-3 right-3 bg-black/60 text-white rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1"
              >
                <X size={12} /> Retake
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="w-full aspect-video rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 flex flex-col items-center justify-center gap-3 text-blue-400 hover:bg-blue-100 transition-colors active:scale-[0.99]"
          >
            <Camera size={36} />
            <div className="text-center">
              <p className="text-sm font-semibold text-blue-600">Take Photo</p>
              <p className="text-xs text-gray-400">or select from gallery</p>
            </div>
          </button>
        )}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
          className="hidden"
        />
        {ocrError && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700">{ocrError}</p>
          </div>
        )}
        {!scanning && autoFilled.size > 0 && !ocrError && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
            <Sparkles size={14} className="text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700">{autoFilled.size} field{autoFilled.size > 1 ? 's' : ''} auto-filled — review and edit if needed</p>
          </div>
        )}
      </div>

      {/* Job Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Job Type</label>
        {visibleJobTypes.length === 0 && selectedRoles.length > 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            No job types available for the selected staff role(s).
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {visibleJobTypes.map(jt => (
            <button
              key={jt.code}
              type="button"
              onClick={() => setJobType(jt.code)}
              className={`px-4 h-10 rounded-xl text-sm font-semibold border transition-colors ${
                jobType === jt.code
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {jt.code}
            </button>
          ))}
        </div>
      </div>

      {/* Assign Staff — multi-select chips */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">
          Assign Staff <span className="text-gray-400 font-normal">(optional · select multiple)</span>
        </label>
        {visibleStaff.length === 0 ? (
          <p className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            No staff available for this job type. Update allowed roles in Settings.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {visibleStaff.map(s => {
              const selected = selectedStaff.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleStaff(s.id)}
                  className={`flex items-center gap-1.5 px-3 h-9 rounded-xl text-sm font-medium border transition-colors ${
                    selected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <User size={13} />
                  <span>{s.name}</span>
                  <span className={`text-xs capitalize ${selected ? 'text-blue-200' : 'text-gray-400'}`}>({s.role.replace('_', ' ')})</span>
                </button>
              )
            })}
          </div>
        )}
        {selectedStaff.length > 0 && (
          <p className="text-xs text-blue-600 font-medium">{selectedStaff.length} staff selected</p>
        )}
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
        <FormField label="Customer Name" placeholder="e.g. Tan Ah Kow" value={form.customerName} onChange={v => handleChange('customerName', v)} autoFilled={autoFilled.has('customerName')} required />
        <FormField label="Phone Number" placeholder="e.g. 012-3456789" value={form.phone} onChange={v => handleChange('phone', v)} type="tel" autoFilled={autoFilled.has('phone')} required />
        <FormField label="Address" placeholder="Full delivery address" value={form.address} onChange={v => handleChange('address', v)} autoFilled={autoFilled.has('address')} required />
        <FormField label="Job Number" placeholder="e.g. DO-20392" value={form.jobNumber} onChange={v => handleChange('jobNumber', v)} autoFilled={autoFilled.has('jobNumber')} required />
        <FormField label="Product" placeholder="e.g. Panasonic AC 1.5HP" value={form.product} onChange={v => handleChange('product', v)} autoFilled={autoFilled.has('product')} required />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Notes (optional)</label>
            {autoFilled.has('notes') && <AutoFilledBadge />}
          </div>
          <textarea
            rows={3}
            placeholder="e.g. Customer requested morning delivery"
            value={form.notes}
            onChange={e => handleChange('notes', e.target.value)}
            className={`w-full rounded-xl border bg-gray-50 px-3 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              autoFilled.has('notes') ? 'border-blue-300' : 'border-gray-200'
            }`}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setForm(emptyForm); setSelectedStaff([]) }}
          className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={submitting || scanning}
          className="flex-1 h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Submit Job'}
        </button>
      </div>
    </form>
  )
}

function AutoFilledBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-blue-500 font-medium">
      <Sparkles size={10} /> Auto-filled
    </span>
  )
}

function FormField({
  label, placeholder, value, onChange, type = 'text', required, autoFilled,
}: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void
  type?: string; required?: boolean; autoFilled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-semibold text-gray-600">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {autoFilled && <AutoFilledBadge />}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className={`rounded-xl border bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          autoFilled ? 'border-blue-300' : 'border-gray-200'
        }`}
      />
    </div>
  )
}
