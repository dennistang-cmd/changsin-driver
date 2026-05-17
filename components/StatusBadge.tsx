import { JobStatus } from '@/types'

const statusConfig: Record<JobStatus, { label: string; bg: string; text: string }> = {
  pending:         { label: 'Pending',         bg: 'bg-amber-100',  text: 'text-amber-700' },
  assigned:        { label: 'Assigned',         bg: 'bg-blue-100',   text: 'text-blue-700' },
  ongoing:         { label: 'On Going',         bg: 'bg-indigo-100', text: 'text-indigo-700' },
  waiting_verify:  { label: 'Waiting Verify',  bg: 'bg-orange-100', text: 'text-orange-700' },
  verified:        { label: 'Verified',         bg: 'bg-green-100',  text: 'text-green-700' },
  completed:       { label: 'Completed',        bg: 'bg-emerald-100',text: 'text-emerald-700' },
  pending_parts:   { label: 'Pending Parts',    bg: 'bg-yellow-100', text: 'text-yellow-800' },
  warranty_claim:  { label: 'Warranty Claim',   bg: 'bg-purple-100', text: 'text-purple-700' },
  product_defect:  { label: 'Product Defect',   bg: 'bg-red-100',    text: 'text-red-700' },
  need_revisit:    { label: 'Need Revisit',     bg: 'bg-rose-100',   text: 'text-rose-700' },
  customer_no_show:{ label: 'No Show',          bg: 'bg-gray-100',   text: 'text-gray-600' },
}

export default function StatusBadge({ status }: { status: JobStatus }) {
  const config = statusConfig[status] ?? { label: status, bg: 'bg-gray-100', text: 'text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}
