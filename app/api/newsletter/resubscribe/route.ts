import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const formData = await req.formData()
  const token = formData.get('token') as string

  if (!token) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?resubscribe=error`
    )
  }

  const supabase = createClient()

  const { error } = await supabase
    .from('emails')
    .update({
      unsubscribed: false,
      resubscribed_at: new Date().toISOString(),
    })
    .eq('confirmation_token', token)

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?resubscribe=error`
    )
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?resubscribe=success`
  )
}
