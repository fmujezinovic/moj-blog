'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function NewsletterPage() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [dailyGrowth, setDailyGrowth] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])

  function downloadCSV(data: any[], filename: string) {
    const csv = [
      Object.keys(data[0]).join(','), 
      ...data.map((row) => Object.values(row).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase
      .from('active_subscribers')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setSubscribers(data)
      })

    supabase
      .from('emails')
      .select('created_at')
      .then(({ data }) => {
        if (!data) return
        const counts: Record<string, number> = {}
        data.forEach((row) => {
          const date = new Date(row.created_at).toISOString().split('T')[0]
          counts[date] = (counts[date] || 0) + 1
        })
        const result = Object.entries(counts).map(([date, count]) => ({ date, count }))
        setDailyGrowth(result.sort((a, b) => a.date.localeCompare(b.date)))
      })

    supabase
      .from('newsletter_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setCampaigns(data)
      })
  }, [])

  const handleSend = async () => {
    setLoading(true)
    const res = await fetch('/api/newsletter/custom-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body }),
    })
    if (res.ok) {
      toast.success('Newsletter uspešno poslan.')
      setSubject('')
      setBody('')
    } else {
      toast.error('Napaka pri pošiljanju.')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-6">
      <h1 className="text-3xl font-bold">Pošlji newsletter</h1>
      <p className="text-muted-foreground">
        Trenutno imaš <strong>{subscribers.length}</strong> aktivnih naročnikov.
      </p>

      {subscribers.length > 0 && (
        <>
          <ul className="space-y-1 text-sm text-muted-foreground mb-2">
            {subscribers.slice(0, 5).map((sub) => (
              <li key={sub.email}>{sub.email}</li>
            ))}
          </ul>
          <Button
            variant="outline"
            onClick={() => downloadCSV(subscribers, 'naročniki.csv')}
          >
            📄 Izvozi CSV
          </Button>
        </>
      )}

      <Input
        placeholder="Zadeva emaila"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <Textarea
        rows={10}
        placeholder="Vsebina emaila (HTML podprt)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <Button onClick={handleSend} disabled={loading} className="w-full">
        {loading ? 'Pošiljam...' : 'Pošlji email naročnikom'}
      </Button>

      {dailyGrowth.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-2">📈 Rast naročnikov po dnevih</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyGrowth}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {campaigns.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-2">📬 Poslane kampanje</h2>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2">Datum</th>
                  <th className="text-left p-2">Zadeva</th>
                  <th className="text-left p-2">Št. prejemnikov</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-2 text-muted-foreground">
                      {new Date(c.created_at).toLocaleString('sl-SI')}
                    </td>
                    <td className="p-2">{c.subject}</td>
                    <td className="p-2">{c.sent_to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
