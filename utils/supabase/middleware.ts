// lib/supabase/middleware.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  try {
    // Create a response to modify
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Refresh session if exists
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error refreshing auth session:', error.message)
      return response
    }

    // Define routes to ignore for auth redirect
    const ignoreAuthRoutes = [
      '/login',
      '/auth/confirm',
      '/confirm',
      '/api', // API routes should not redirect
    ]
    const isIgnored = ignoreAuthRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

    // If no session or expired, redirect to login for protected routes (but not ignored routes)
    if (!session && request.nextUrl.pathname.startsWith('/dashboard') && !isIgnored) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (e) {
    // If there's an error, redirect to login as a fallback
    console.error('Middleware error:', e)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
