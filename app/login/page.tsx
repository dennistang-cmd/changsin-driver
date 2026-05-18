'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStaffStore } from '@/lib/staff-store'
import { useAuthStore } from '@/lib/auth-store'
import { Zap, Eye, EyeOff } from 'lucide-react'

const roleColors: Record<string, string> = {
  driver: 'bg-blue-100 text-blue-700',
  installer: 'bg-purple-100 text-purple-700',
  technician: 'bg-orange-100 text-orange-700',
  sales_assistant: 'bg-pink-100 text-pink-700',
  secretary: 'bg-teal-100 text-teal-700',
  boss: 'bg-gray-900 text-white',
}

export default function LoginPage() {
  const router = useRouter()
  const staff = useStaffStore(s => s.staff)
  const login = useAuthStore(s => s.login)

  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      const found = staff.find(
        s => s.loginId.toLowerCase() === loginId.trim().toLowerCase() && s.isActive
      )

      if (!found) {
        setError('Staff ID not found or account is inactive.')
        setLoading(false)
        return
      }

      const pw = found.password ?? '1234'
      if (password !== pw) {
        setError('Incorrect password.')
        setLoading(false)
        return
      }

      login(found)
      router.replace('/dashboard')
    }, 400)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg mb-3">
          <Zap size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Chang Sin</h1>
        <p className="text-sm text-gray-500 mt-1">Workforce Management</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">Sign In</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Staff ID</label>
            <input
              type="text"
              autoComplete="username"
              placeholder="e.g. boss, ahmad.driver"
              value={loginId}
              onChange={e => { setLoginId(e.target.value); setError('') }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Demo hint */}
      <div className="mt-6 w-full max-w-sm bg-white/70 rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-500 mb-2">Demo Accounts (password: 1234)</p>
        <div className="flex flex-col gap-1.5">
          {staff.filter(s => s.isActive).slice(0, 5).map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setLoginId(s.loginId); setPassword('1234'); setError('') }}
              className="flex items-center gap-2 text-left hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
            >
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[s.role] ?? 'bg-gray-100 text-gray-600'}`}>
                {s.role.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-600">{s.name}</span>
              <span className="text-xs text-gray-400 font-mono ml-auto">{s.loginId}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
