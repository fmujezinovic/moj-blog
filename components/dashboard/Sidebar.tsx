"use client";


import { Mail } from "lucide-react"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, FilePlus, Folder, PlusCircle } from "lucide-react"; // ➕ Dodal PlusCircle ikono
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Send } from "lucide-react"
import { toast } from "sonner"

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
        className={cn(
          "w-full justify-start gap-2",
          isActive("/dashboard") && activeClass
        )}
      >
        <Link href="/dashboard">
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2",
          isActive("/dashboard/posts") && activeClass
        )}
      >
        <Link href="/dashboard/posts">
          <FileText className="h-5 w-5" />
          Posts
        </Link>
      </Button>

      {/* ➕ Create New Post */}
      <Button
        asChild
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2",
          isActive("/dashboard/posts/create") && activeClass
        )}
      >
        <Link href="/dashboard/posts/create">
          <PlusCircle className="h-5 w-5" />
          Create Post
        </Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2",
          isActive("/dashboard/pages") && activeClass
        )}
      >
        <Link href="/dashboard/pages">
          <FilePlus className="h-5 w-5" />
          Pages
        </Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2",
          isActive("/dashboard/categories") && activeClass
        )}
      >
        <Link href="/dashboard/categories">
          <Folder className="h-5 w-5" />
          Categories
        </Link>
      </Button>

      <Button
  variant="ghost"
  className="w-full justify-start gap-2"
  onClick={async () => {
    const res = await fetch('/api/newsletter/send', { method: 'POST' });
    if (res.ok) {
      toast.success("Email uspešno poslan naročnikom.");
    } else {
      toast.error("Napaka pri pošiljanju.");
    }
  }}
>
  <Send className="h-5 w-5" />
  Pošlji email naročnikom
</Button>

      <AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="ghost" className="w-full justify-start gap-2">
      <Send className="h-5 w-5" />
      Pošlji email naročnikom
    </Button>
  </AlertDialogTrigger>

  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Pošlji email vsem naročnikom?</AlertDialogTitle>
      <AlertDialogDescription>
        S tem boš vsem potrjenim naročnikom poslal email kampanjo. Želiš nadaljevati?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Prekliči</AlertDialogCancel>
      <AlertDialogAction
        onClick={async () => {
          const res = await fetch('/api/newsletter/send', { method: 'POST' })
          if (res.ok) {
            toast.success("Email uspešno poslan naročnikom.")
          } else {
            toast.error("Napaka pri pošiljanju.")
          }
        }}
      >
        Pošlji
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
      </AlertDialog>

      <Button
  asChild
  variant="ghost"
  className={cn(
    "w-full justify-start gap-2",
    isActive("/dashboard/newsletter") && activeClass
  )}
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
