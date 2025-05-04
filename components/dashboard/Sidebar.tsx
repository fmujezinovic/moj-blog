"use client";

import { Mail, LayoutDashboard, FileText, FilePlus, Folder, PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname.startsWith(path);

  const activeClass =
    "bg-primary/10 text-primary font-semibold border-l-4 border-primary";

  return (
    <aside className="w-64 h-screen border-r bg-muted/40 p-4 space-y-2 hidden md:flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>

      <Button
        asChild
        variant="ghost"
        className={cn("w-full justify-start gap-2", isActive("/dashboard") && activeClass)}
      >
        <Link href="/dashboard">
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        className={cn("w-full justify-start gap-2", isActive("/dashboard/posts") && activeClass)}
      >
        <Link href="/dashboard/posts">
          <FileText className="h-5 w-5" />
          Posts
        </Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        className={cn("w-full justify-start gap-2", isActive("/dashboard/posts/create") && activeClass)}
      >
        <Link href="/dashboard/posts/create">
          <PlusCircle className="h-5 w-5" />
          Create Post
        </Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        className={cn("w-full justify-start gap-2", isActive("/dashboard/pages") && activeClass)}
      >
        <Link href="/dashboard/pages">
          <FilePlus className="h-5 w-5" />
          Pages
        </Link>
      </Button>

      {/* ➕ Create New Page */}
      <Button
        asChild
        variant="ghost"
        className={cn("w-full justify-start gap-2", isActive("/dashboard/pages/create") && activeClass)}
      >
        <Link href="/dashboard/pages/create">
          <PlusCircle className="h-5 w-5" />
          Create Page
        </Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        className={cn("w-full justify-start gap-2", isActive("/dashboard/categories") && activeClass)}
      >
        <Link href="/dashboard/categories">
          <Folder className="h-5 w-5" />
          Categories
        </Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        className={cn("w-full justify-start gap-2", isActive("/dashboard/newsletter") && activeClass)}
      >
        <Link href="/dashboard/newsletter">
          <Mail className="h-5 w-5" />
          Newsletter
        </Link>
      </Button>
    </aside>
  );
};

export default Sidebar;
