import { TimelineEvent } from '@/types'
import { CheckCircle } from 'lucide-react'

function formatTime(ts: string) {
  return new Date(ts).toLocaleString('en-MY', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative border-l border-blue-200 ml-3">
      {events.map((event, i) => (
        <li key={event.id} className={`mb-4 ml-5 ${i === events.length - 1 ? '' : ''}`}>
          <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-4 ring-white">
            <CheckCircle size={14} className="text-blue-600" />
          </span>
          <p className="text-sm font-medium text-gray-900">{event.label}</p>
          <p className="text-xs text-gray-400">
            {formatTime(event.timestamp)}{event.actor ? ` · ${event.actor}` : ''}
          </p>
        </li>
      ))}
    </ol>
  )
}
