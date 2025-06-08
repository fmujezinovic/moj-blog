'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const supabase = createClient()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Samo emailRedirectTo je podprt
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login/callback`,
      },
    })

    if (error) {
      alert('Napaka: ' + error.message)
    } else {
      alert('✅ Magic link poslan. Preveri e-pošto.')
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Prijava</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-pošta"
        className="w-full border p-2 mb-4"
      />
      <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2">
        Pošlji povezavo
      </button>
    </div>
  )
}
