'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2">
      Odjava
    </button>
  )
}
