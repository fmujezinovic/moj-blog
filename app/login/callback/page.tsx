'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function LoginCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const check = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (data.session) {
        console.log('✅ Prijavljen:', data.session)
        router.replace('/dashboard')
      } else {
        console.error('❌ Ni prijave')
        router.replace('/login')
      }
    }

    check()
  }, [router, supabase])

  return (
    <div className="p-8 text-center">
      <p>Preverjam prijavo...</p>
    </div>
  )
}
