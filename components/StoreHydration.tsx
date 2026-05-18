'use client'

import { useEffect } from 'react'
import { useJobsStore } from '@/lib/jobs-store'
import { useStaffStore } from '@/lib/staff-store'
import { useSettingsStore } from '@/lib/settings-store'
import { useAuthStore } from '@/lib/auth-store'

export default function StoreHydration() {
  useEffect(() => {
    useAuthStore.persist.rehydrate()
    useJobsStore.persist.rehydrate()
    useStaffStore.persist.rehydrate()
    useSettingsStore.persist.rehydrate()
  }, [])

  return null
}
