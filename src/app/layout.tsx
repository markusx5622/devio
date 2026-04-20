import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Devio — Control Estadístico de Procesos',
  description:
    'Analiza procesos industriales con cartas de control SPC, detección de reglas de Nelson y capacidad de proceso Cp/Cpk. Sin instalación, sin cuenta.',
  keywords: [
    'SPC',
    'control estadístico de procesos',
    'cartas de control',
    'Six Sigma',
    'Cp',
    'Cpk',
    'calidad industrial',
    'Nelson rules',
    'X-bar R',
    'I-MR',
  ],
  openGraph: {
    title: 'Devio — Control Estadístico de Procesos',
    description:
      'Sube un CSV o Excel y obtén cartas de control SPC, violaciones de Nelson y capacidad de proceso en segundos.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
