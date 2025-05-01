import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/utils/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { subject, body } = await req.json()

  if (!subject || !body) {
    return NextResponse.json({ error: 'Manjka vsebina ali zadeva.' }, { status: 400 })
  }

  const supabase = createClient()

  const { data: subscribers, error } = await supabase
    .from('emails')
    .select('email, confirmation_token')
    .eq('confirmed', true)
    .eq('unsubscribed', false)

  if (error || !subscribers) {
    return NextResponse.json({ error: 'Napaka pri branju naročnikov' }, { status: 500 })
  }

  const emails = subscribers.map(({ email, confirmation_token }) => ({
    from: 'newsletter@tvojadomena.si',
    to: email,
    subject: subject,
    html: `
      ${body}
      <br /><br />
      <p style="font-size:12px; color:gray;">
        Ne želiš več prejemati sporočil?
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?token=${confirmation_token}">Odjava</a>
      </p>
    `,
  }))

  // ✉️ Pošlji vse
  await resend.batch.send(emails)

  // 📝 Zabeleži kampanjo v Supabase
  await supabase.from('newsletter_campaigns').insert({
    subject,
    body,
    sent_to: emails.length,
  })

  return NextResponse.json({ success: true, sent: emails.length })
}
