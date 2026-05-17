'use client'

import { useState, useRef } from 'react'
import { Camera, X, ChevronDown, CheckCircle2 } from 'lucide-react'
import { JobType } from '@/types'

const jobTypes: JobType[] = ['DO', 'JO', 'Repair', 'Installation']

export default function UploadPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [jobType, setJobType] = useState<JobType>('DO')
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    jobNumber: '',
    product: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const cameraRef = useRef<HTMLInputElement>(null)

  function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCapturedImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleRetake() {
    setCapturedImage(null)
    if (cameraRef.current) cameraRef.current.value = ''
  }

  function handleChange(field: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSaveDraft() {
    alert('Draft saved!')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 1500)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Job Submitted!</h2>
        <p className="text-sm text-gray-500 mb-8">The job has been created and is pending assignment.</p>
        <button
          onClick={() => { setSubmitted(false); setCapturedImage(null); setForm({ customerName: '', phone: '', address: '', jobNumber: '', product: '', notes: '' }) }}
          className="w-full max-w-xs h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all"
        >
          Upload Another Job
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 pt-6 pb-4 flex flex-col gap-5">
      <h1 className="text-xl font-bold text-gray-900">Upload Job</h1>

      {/* Camera / Photo */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">DO / JO Photo</label>
        {capturedImage ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleRetake}
              className="absolute top-3 right-3 bg-black/60 text-white rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1"
            >
              <X size={12} /> Retake
            </button>
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
      </div>

      {/* Job Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Job Type</label>
        <div className="flex gap-2">
          {jobTypes.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setJobType(type)}
              className={`flex-1 h-11 rounded-xl text-sm font-semibold border transition-colors ${
                jobType === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
        <FormField label="Customer Name" placeholder="e.g. Tan Ah Kow" value={form.customerName} onChange={v => handleChange('customerName', v)} required />
        <FormField label="Phone Number" placeholder="e.g. 012-3456789" value={form.phone} onChange={v => handleChange('phone', v)} type="tel" required />
        <FormField label="Address" placeholder="Full delivery address" value={form.address} onChange={v => handleChange('address', v)} required />
        <FormField label="Job Number" placeholder="e.g. DO-20392" value={form.jobNumber} onChange={v => handleChange('jobNumber', v)} required />
        <FormField label="Product" placeholder="e.g. Panasonic AC 1.5HP" value={form.product} onChange={v => handleChange('product', v)} required />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">Notes (optional)</label>
          <textarea
            rows={3}
            placeholder="e.g. Customer requested morning delivery"
            value={form.notes}
            onChange={e => handleChange('notes', e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSaveDraft}
          className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all"
        >
          Save Draft
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 h-11 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit Job'}
        </button>
      </div>
    </form>
  )
}

function FormField({
  label, placeholder, value, onChange, type = 'text', required,
}: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
