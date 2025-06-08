import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import type { EmailOtpType, MobileOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get('token_hash');
  const typeParam = url.searchParams.get('type') as string | null;
  const nextUrl = url.searchParams.get('next') ?? '/dashboard';

  // Preveri, da imamo token in tip
  if (!token_hash || !typeParam) {
    return NextResponse.redirect('/login');
  }

  // Dovoljene vrednosti za tip
  const validTypes = ['email', 'sms'] as const;
  if (!validTypes.includes(typeParam as any)) {
    console.error(`Invalid OTP type: ${typeParam}`);
    return NextResponse.redirect('/login');
  }

  // TypeScript zdaj ve, da je to en izmed dovoljenih tipov
  const otpType = typeParam as EmailOtpType | MobileOtpType;

  // Kličemo Supabase
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: otpType,
    token_hash,
  });

  if (!error) {
    // Prijava uspešna → na nextUrl
    return NextResponse.redirect(nextUrl);
  }

  console.error('Auth verifyOtp error:', error.message);
  // Če je napaka, nazaj na login
  return NextResponse.redirect('/login');
}
