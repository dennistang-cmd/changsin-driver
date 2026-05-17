'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Upload, LayoutDashboard, ClipboardList, Users, Settings, Receipt } from 'lucide-react'

const tabs = [
  { href: '/upload',     label: 'Upload',    icon: Upload },
  { href: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs',       label: 'Jobs',      icon: ClipboardList },
  { href: '/commission', label: 'Report',    icon: Receipt },
  { href: '/staff',      label: 'Staff',     icon: Users },
  { href: '/settings',   label: 'Settings',  icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="max-w-md mx-auto flex">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href) && href !== '/upload')
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
