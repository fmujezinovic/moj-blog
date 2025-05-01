import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/utils/supabase/server'
import { randomBytes } from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Neveljaven email' }, { status: 400 })
  }

  const token = randomBytes(32).toString('hex')
  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/confirm?token=${token}`

  const supabase = createClient()

  const { error } = await supabase
    .from('emails')
    .upsert({ email, confirmation_token: token }, { onConflict: 'email' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await resend.emails.send({
    from: 'newsletter@tvojadomena.si',
    to: email,
    subject: 'Potrdi svojo prijavo',
    html: `
      <p>Hvala za prijavo na naš newsletter! 🙌</p>
      <p>Za dokončanje prijave, klikni spodnjo povezavo:</p>
      <p><a href="${confirmUrl}">Potrdi prijavo</a></p>
      <p>Če se nisi prijavil/a, ignoriraj ta email.</p>
    `,
  })

  return NextResponse.json({ success: true })
}
