import Sidebar from "@/components/dashboard/Sidebar";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("🧠 USER:", user);
  if (userError) console.error("❌ User fetch error:", userError);

  if (!user) {
    console.warn("⛔ No user – redirecting to /login");
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  console.log("🔐 PROFILE:", profile);
  if (profileError) console.error("❌ Profile fetch error:", profileError);

  if (!profile || profile.role !== "admin") {
    console.warn("⛔ Not admin – redirecting to /");
    redirect("/");
  }

  return (
    <div className={`flex min-h-screen ${inter.variable} font-sans bg-background text-foreground`}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
