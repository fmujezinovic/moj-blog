"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Header() {
  const router = useRouter();
  const supabase = createClient();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Scroll handling
    function onScroll() {
      setIsScrolled(window.scrollY > 10);

      const kategorije = document.getElementById("kategorije");
      const povezave = document.getElementById("povezave");

      if (kategorije && povezave) {
        const kategorijeTop = kategorije.getBoundingClientRect().top;
        const povezaveTop = povezave.getBoundingClientRect().top;

        if (kategorijeTop <= 100 && povezaveTop > 100) {
          setActiveSection("kategorije");
        } else if (povezaveTop <= 100) {
          setActiveSection("povezave");
        } else {
          setActiveSection(null);
        }
      }
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Dohvati korisnika ako je prijavljen
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur transition-all ${
        isScrolled ? "bg-background/90 border-b" : "bg-background/50"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight hover:text-primary transition-colors"
        >
          Domov
        </Link>

        <div className="flex items-center gap-8 text-sm font-medium">
          <NavLink href="/o-meni" isActive={false}>
            O meni
          </NavLink>
          <NavLink href="/#kategorije" isActive={activeSection === "kategorije"}>
            Kategorije
          </NavLink>
          <NavLink href="/#povezave" isActive={activeSection === "povezave"}>
            Povezave
          </NavLink>

          {user && (
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Odjavi se
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
};

function NavLink({ href, children, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`relative transition-colors hover:text-primary ${
        isActive ? "text-primary" : ""
      }`}
    >
      {children}
      <span
        className={`absolute left-0 -bottom-1 h-[2px] w-full bg-primary transition-transform duration-300 ${
          isActive ? "scale-x-100" : "scale-x-0"
        } origin-left`}
      />
    </Link>
  );
}
