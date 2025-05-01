import { createClient } from '@/utils/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const dynamic = 'force-dynamic'

export default async function ConfirmPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token
  const supabase = createClient()

  if (!token) {
    return <Message type="error" text="Manjka potrditveni žeton." />
  }

  // POZOR: ne nastavimo confirmation_token = null, če ga rabimo za odjavo
  const { data: emailRow, error } = await supabase
    .from('emails')
    .update({ confirmed: true }) // potrdi, a ohrani token
    .eq('confirmation_token', token)
    .select()
    .maybeSingle()

  if (error || !emailRow) {
    return <Message type="error" text="Potrditev ni uspela ali je povezava že uporabljena." />
  }

  // ✅ Pošlji dobrodošlico z odjavnim linkom
  await resend.emails.send({
    from: 'newsletter@tvojadomena.si',
    to: emailRow.email,
    subject: 'Dobrodošel v našem newsletterju!',
    html: `
      <h2>Hvala za prijavo 🙌</h2>
      <p>Zelo smo veseli, da si z nami.</p>
      <p>V prihodnjih dneh ti bomo pošiljali izbrane vsebine, članke in novosti.</p>
      <br />
      <p style="font-size:12px; color:gray;">
        Ne želiš več prejemati novic?
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?token=${token}">Odjavi se tukaj</a>.
      </p>
    `,
  })

  return <Message type="success" text="Hvala! Tvoj email je potrjen in dobrodošlica je bila poslana. ✅" />
}

function Message({ type, text }: { type: 'success' | 'error'; text: string }) {
  const color = type === 'success' ? 'text-green-600' : 'text-red-600'
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className={`text-center text-xl font-medium ${color}`}>{text}</div>
    </main>
  )
}
