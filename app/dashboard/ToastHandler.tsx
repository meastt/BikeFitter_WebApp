'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/components/toast'

export function ToastHandler() {
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  useEffect(() => {
    const success = searchParams.get('success')

    if (success === 'profile_saved') {
      showToast('Profile saved successfully!', 'success')
    } else if (success === 'bike_created') {
      showToast('Bike added successfully!', 'success')
    }

    // Clean up URL without reload
    if (success) {
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, showToast])

  return null
}
