'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const allowedEmails = ['fmujezinovic@gmail.com']

  // 🔁 Ako korisnik dođe s magic linkom (?code=...), proveri sesiju
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          if (session) {
            router.replace('/dashboard')
          }
        })
        .catch(() => {
          setError('Nešto je pošlo po zlu pri prijavi.')
        })
    }
  }, [searchParams, supabase, router])

  // 🔁 Ako korisnik već ima sesiju, preusmeri s login stranice
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard')
      }
    })
  }, [supabase, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    if (!allowedEmails.includes(email.trim().toLowerCase())) {
      setError('Ta email adresa nije dozvoljena.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">Prijava preko email linka</h1>

        <input
          type="email"
          placeholder="Tvoj email"
          className="block w-full border border-gray-300 rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {loading && <p className="text-sm text-blue-500">Pošiljam povezavo...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">Link za prijavo je poslan na email.</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? 'Pošiljanje...' : 'Pošalji magic link'}
        </button>
      </form>
    </div>
  )
}
