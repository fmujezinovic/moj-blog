import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get('token_hash');
  const typeParam = url.searchParams.get('type') as string | null;
  const nextUrl = url.searchParams.get('next') ?? '/dashboard';

  // 1. Preveri parametre
  if (!token_hash || typeParam !== 'email') {
    console.error(`Invalid or missing OTP type/token: type=${typeParam}, token=${token_hash}`);
    return NextResponse.redirect('/login');
  }

  // 2. Kličemo Supabase za email OTP
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: typeParam as EmailOtpType,
    token_hash
  });

  // 3. Preusmeritev
  if (!error) {
    return NextResponse.redirect(nextUrl);
  }

  console.error('Auth verifyOtp error:', error.message);
  return NextResponse.redirect('/login');
}
