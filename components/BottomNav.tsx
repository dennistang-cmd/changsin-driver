'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Upload, LayoutDashboard, ClipboardList, Users, Settings, Receipt, LogOut } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { useState } from 'react'

const tabs = [
  { href: '/upload',     label: 'Upload',    icon: Upload },
  { href: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs',       label: 'Jobs',      icon: ClipboardList },
  { href: '/commission', label: 'Report',    icon: Receipt },
  { href: '/staff',      label: 'Staff',     icon: Users },
  { href: '/settings',   label: 'Settings',  icon: Settings },
]

const roleColors: Record<string, string> = {
  driver: 'bg-blue-100 text-blue-700',
  installer: 'bg-purple-100 text-purple-700',
  technician: 'bg-orange-100 text-orange-700',
  sales_assistant: 'bg-pink-100 text-pink-700',
  secretary: 'bg-teal-100 text-teal-700',
  boss: 'bg-gray-800 text-white',
}

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const currentUser = useAuthStore(s => s.currentUser)
  const logout = useAuthStore(s => s.logout)
  const [showLogout, setShowLogout] = useState(false)

  if (pathname === '/login') return null

  function handleLogout() {
    logout()
    setShowLogout(false)
    router.replace('/login')
  }

  return (
    <>
      {/* User bar */}
      {currentUser && (
        <div className="fixed bottom-[57px] left-0 right-0 z-40 bg-white border-t border-gray-100">
          <div className="max-w-md mx-auto flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[currentUser.role] ?? 'bg-gray-100 text-gray-600'}`}>
                {currentUser.role.replace('_', ' ')}
              </span>
              <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
            </div>
            <button
              onClick={() => setShowLogout(v => !v)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Logout confirm */}
      {showLogout && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end justify-center" onClick={() => setShowLogout(false)}>
          <div className="w-full max-w-md bg-white rounded-t-2xl px-5 pt-6 pb-8" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-semibold text-gray-800 mb-1">Sign out?</p>
            <p className="text-xs text-gray-500 mb-5">You will need to sign in again to access the system.</p>
            <div className="flex gap-3">
              <button onClick={handleLogout} className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">
                Sign Out
              </button>
              <button onClick={() => setShowLogout(false)} className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  )
}
