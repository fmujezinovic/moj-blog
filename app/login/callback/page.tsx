'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function LoginCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const exchangeCode = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession()
      if (error) {
        console.error('Exchange error:', error)
        router.replace('/login')
      } else {
        router.replace('/dashboard')
      }
    }

    exchangeCode()
  }, [router, supabase])

  return (
    <div className="p-8">
      <p>Prijavljamo vas...</p>
    </div>
  )
}
