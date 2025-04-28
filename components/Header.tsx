"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border transition-all">
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-extrabold tracking-tight hover:text-primary transition-colors">
          Domov
        </Link>
        <div className="flex items-center gap-8 text-sm font-medium">
          <Link href="/o-meni" className="hover:text-primary transition-colors">
            O meni
          </Link>
          <Link href="/#kategorije" className="hover:text-primary transition-colors">
            Kategorije
          </Link>
          <Link href="/#povezave" className="hover:text-primary transition-colors">
            Povezave
          </Link>
        </div>
      </nav>
    </header>
  );
}
