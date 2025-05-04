import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token_hash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  const next = url.searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error) {
      // 🔐 Uspela prijava – redirect na dashboard
      return NextResponse.redirect(next)
    } else {
      console.error('Auth verifyOtp error:', error.message)
    }
  }

  // ⛔ Če nekaj ne štima – nazaj na login
  return NextResponse.redirect('/login')
}
