'use client'

import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      setSubmitted(true)
    }
  }

  return (
    <div className="bg-muted p-6 rounded-xl mt-16 shadow-md">
      <h3 className="text-xl font-semibold mb-2">Prijavi se na e-novice</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Prejmi nove objave in koristne vsebine direktno v svoj email.
      </p>

      {submitted ? (
        <p className="text-green-600 font-medium">Preveri svoj email za potrditev ✅</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tvoj email naslov"
            className="flex-1 px-4 py-2 rounded border border-input"
          />
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Prijavi se
          </button>
        </form>
      )}
    </div>
  )
}
