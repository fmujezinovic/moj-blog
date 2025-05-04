'use server'

import { createClient } from '@/utils/supabase/server'

export async function sendMagicLink(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  })

  if (error) throw new Error(error.message)
}
