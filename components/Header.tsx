"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
      <nav className="max-w-5xl mx-auto px-6 flex justify-between items-center h-16">
        <Link href="/" className="text-lg font-bold">
          Domov
        </Link>
              <div className="flex space-x-6">
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
