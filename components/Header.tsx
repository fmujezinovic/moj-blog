'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
};

function NavLink({ href, children, isActive, onClick }: NavLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`relative transition-colors hover:text-primary ${
        isActive ? 'text-primary' : ''
      }`}
    >
      {children}
      <span
        className={`absolute left-0 -bottom-1 h-[2px] w-full bg-primary transition-transform duration-300 ${
          isActive ? 'scale-x-100' : 'scale-x-0'
        } origin-left`}
      />
    </button>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 10);

      const kategorije = document.getElementById('kategorije');
      const povezave = document.getElementById('povezave');

      if (kategorije && povezave) {
        const kategorijeTop = kategorije.getBoundingClientRect().top;
        const povezaveTop = povezave.getBoundingClientRect().top;

        if (kategorijeTop <= 100 && povezaveTop > 100) {
          setActiveSection('kategorije');
        } else if (povezaveTop <= 100) {
          setActiveSection('povezave');
        } else {
          setActiveSection(null);
        }
      }
    }

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      if (userData.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', userData.user.id)
          .single();

        if (profile) {
          setRole(profile.role);
        }
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const goToSection = (sectionId: string) => {
    if (pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(`/#${sectionId}`);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur transition-all ${
        isScrolled ? 'bg-background/90 border-b' : 'bg-background/50'
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
            <Link href="/o-meni">O meni</Link>
          </NavLink>
          <NavLink
            href="/#kategorije"
            isActive={activeSection === 'kategorije'}
            onClick={() => goToSection('kategorije')}
          >
            Kategorije
          </NavLink>

          {!loading && user && role === 'admin' && (
            <>
              <NavLink href="/dashboard" isActive={pathname.startsWith('/dashboard')}>
                <Link href="/dashboard">Dashboard</Link>
              </NavLink>

              <button
                onClick={handleLogout}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Odjavi se
              </button>

              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground border">
                {user.email?.charAt(0).toUpperCase() ?? 'A'}
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
