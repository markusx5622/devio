'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Moon, Sun } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = useCallback(() => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
    setIsDark(next);
  }, [isDark]);

  return { isDark, toggle };
}

export function AppHeader() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { isDark, toggle } = useDarkMode();

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

        <div className="flex items-center gap-4">
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

          <motion.button
            type="button"
            onClick={toggle}
            aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            className="rounded-lg p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? 'sun' : 'moon'}
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 30, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex"
              >
                {isDark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
