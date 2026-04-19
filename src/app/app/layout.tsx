import type { Metadata } from 'next';
import Link from 'next/link';
import { BarChart2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard — Devio',
  description: 'Análisis de Control Estadístico de Procesos',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-neutral-800 dark:text-neutral-100 hover:opacity-80 transition-opacity">
            <BarChart2 className="h-5 w-5 text-blue-600" aria-hidden />
            Devio
          </Link>
          <nav className="flex items-center gap-6 text-sm" aria-label="Navegación principal">
            <Link href="/" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Inicio
            </Link>
            <Link href="/app" className="text-blue-600 dark:text-blue-400 font-medium">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-700 py-4 text-center text-xs text-neutral-400">
        Devio — Control Estadístico de Procesos
      </footer>
    </div>
  );
}
