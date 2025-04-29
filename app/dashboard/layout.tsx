import Sidebar from "@/components/dashboard/Sidebar";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Dozvoli samo sebi (možeš koristiti email ili user.id)
  if (!user || user.email !== "fmujezinovic@gmail.com") {
    redirect("/");
  }

  return (
    <div className={`flex min-h-screen ${inter.variable} font-sans bg-background text-foreground`}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
