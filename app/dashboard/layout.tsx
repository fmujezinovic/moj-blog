import Sidebar from "@/components/dashboard/Sidebar";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/require-admin";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default async function DashboardLayout({ children }: { children: ReactNode }) {


  return (
    <div className={`flex min-h-screen ${inter.variable} font-sans bg-background text-foreground`}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
