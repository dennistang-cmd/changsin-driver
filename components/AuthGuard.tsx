'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'

export default function AuthGuard() {
  const currentUser = useAuthStore(s => s.currentUser)
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    if (!currentUser && pathname !== '/login') {
      router.replace('/login')
    }
    if (currentUser && pathname === '/login') {
      router.replace('/dashboard')
    }
  }, [ready, currentUser, pathname, router])

  return null
}
