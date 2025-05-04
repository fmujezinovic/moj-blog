'use client'

import { useState } from 'react'
import { sendMagicLink } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFormStatus } from 'react-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  async function handleSendMagicLink(formData: FormData) {
    try {
      await sendMagicLink(formData)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Prijava z e-pošto</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSendMagicLink} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email naslov</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="vasa@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <SubmitButton />
            {status === 'success' && (
              <p className="text-sm text-green-600 pt-2">
                ✅ Prijavni link je bil poslan. Preverite svoj e-nabiralnik.
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-600 pt-2">
                ❌ Prišlo je do napake. Poskusite znova.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Pošiljanje...' : 'Pošlji prijavni link'}
    </Button>
  )
}
