import Sidebar from "@/components/dashboard/Sidebar"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  // 🔐 Preveri če je uporabnik prijavljen
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // 🔒 Preveri če ima uporabnik vlogo 'admin'
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className={`flex min-h-screen ${inter.variable} font-sans bg-background text-foreground`}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
