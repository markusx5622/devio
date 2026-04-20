'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function AppHeader() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 0);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { href: '/',    label: 'Inicio',    active: pathname === '/' },
    { href: '/app', label: 'Dashboard', active: pathname?.startsWith('/app') ?? false },
  ];

  return (
    <header
      className={[
        'sticky top-0 z-50 transition-all duration-200',
        scrolled
          ? 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-700/50 shadow-sm'
          : 'bg-transparent border-b border-transparent',
      ].join(' ')}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tight text-neutral-800 dark:text-neutral-100 hover:opacity-80 transition-opacity"
        >
          <motion.div
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <BarChart2 className="h-5 w-5 text-blue-600" aria-hidden />
          </motion.div>
          Devio
        </Link>

        <nav className="flex items-center gap-6 text-sm" aria-label="Navegación principal">
          {links.map(({ href, label, active }) => (
            <Link
              key={href}
              href={href}
              className={[
                'relative py-1 transition-colors duration-150',
                active
                  ? 'text-blue-600 dark:text-blue-400 font-medium pointer-events-none'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              {label}
              {active && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400"
                />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
