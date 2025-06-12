import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClient() {
  return createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies(); // čekamo ovde
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
