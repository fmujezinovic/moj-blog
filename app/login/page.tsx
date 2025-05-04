'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
  await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: 'http://localhost:3000/login/callback',
  },
})

    if (error) {
      alert('Napaka pri prijavi: ' + error.message)
    } else {
      alert('Preveri e-pošto za prijavno povezavo.')
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Prijava</h1>
      <input
        type="email"
        placeholder="Vnesi e-pošto"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border mb-4"
      />
      <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2">
        Pošlji prijavno povezavo
      </button>
    </div>
  )
}
