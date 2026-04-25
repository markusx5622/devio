import type { Metadata } from 'next';
import { AppHeader } from '@/components/layout/AppHeader';

export const metadata: Metadata = {
  title: 'Dashboard — Devio',
  description: 'Análisis de Control Estadístico de Procesos',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <AppHeader />

      <main className="flex-1 mx-auto w-11/12 max-w-full py-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-neutral-200 dark:border-neutral-700 py-4 text-center text-xs text-neutral-400">
        Devio — Control Estadístico de Procesos
      </footer>
    </div>
  );
}
