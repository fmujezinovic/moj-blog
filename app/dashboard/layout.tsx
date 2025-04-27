// app/dashboard/layout.tsx

import Sidebar from "@/components/dashboard/Sidebar";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

// Uvozimo lep font
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`flex min-h-screen ${inter.variable} font-sans bg-background text-foreground`}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
