import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const resubscribe = searchParams.get('resubscribe')
  const supabase = createClient()

  // 1. Prikaz po ponovni prijavi
  if (resubscribe === 'success') {
    return Response.json({
      status: 'success',
      message: 'Ponovno si se uspešno prijavil ✅',
    })
  }

  if (resubscribe === 'error') {
    return Response.json({
      status: 'error',
      message: 'Pri ponovni prijavi je prišlo do napake.',
    })
  }

  // 2. Preveri token
  if (!token) {
    return Response.json({
      status: 'error',
      message: 'Manjka odjavni žeton.',
    })
  }

  // 3. Odjava v bazi
  const { data: emailRow, error } = await supabase
    .from('emails')
    .update({
      unsubscribed: true,
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('confirmation_token', token)
    .select()
    .maybeSingle()

  if (error || !emailRow) {
    return Response.json({
      status: 'error',
      message: 'Odjava ni uspela ali povezava ni veljavna.',
    })
  }

  // 4. Uspešna odjava
  return Response.json({
    status: 'success',
    message: 'Uspešno si se odjavil od prejemanja novic. 🙁',
    token, // vrni token za morebitno ponovno prijavo
  })
}
