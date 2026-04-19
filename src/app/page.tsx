import Link from 'next/link';
import { BarChart2, ShieldCheck, Zap, GitBranch, ArrowRight, ExternalLink } from 'lucide-react';

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: Zap,
    title: 'Análisis automático',
    description:
      'Sube un CSV o Excel y Devio detecta automáticamente si tus datos son individuales o subgrupos. Selecciona la carta de control adecuada (X̄-R, X̄-S o I-MR) sin configuración manual.',
  },
  {
    icon: ShieldCheck,
    title: 'Reglas de Nelson',
    description:
      'Las 8 reglas de Nelson se aplican automáticamente para identificar patrones no aleatorios: tendencias, estratificación, mezcla y causas asignables, con explicaciones en lenguaje claro.',
  },
  {
    icon: GitBranch,
    title: 'Capacidad de proceso',
    description:
      'Calcula Cp, Cpk (corto plazo) y Pp, Ppk (largo plazo) con interpretación categórica. Incluye histograma de distribución con curva normal teórica para validación visual.',
  },
];

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 p-6 space-y-3">
      <div className="inline-flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2.5">
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">{title}</h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{description}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Nav */}
      <header className="border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-neutral-800 dark:text-neutral-100">
            <BarChart2 className="h-5 w-5 text-blue-600" aria-hidden />
            Devio
          </div>
          <Link
            href="/app"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Dashboard <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-16 text-center" aria-label="Introducción">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 mb-6">
            <Zap className="h-3 w-3" aria-hidden /> Control Estadístico de Procesos
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
            Devio — Control Estadístico<br className="hidden sm:block" /> de Procesos{' '}
            <span className="text-blue-600 dark:text-blue-400">para el resto de nosotros</span>
          </h1>

          <p className="mt-6 text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            El Control Estadístico de Procesos (SPC) es la disciplina que permite distinguir la
            variación normal de un proceso de las señales que indican que algo ha cambiado.
            Devio lo hace accesible: sube tus datos, obtén cartas de control, violaciones de
            reglas y capacidad de proceso en segundos.
          </p>

          <p className="mt-4 text-base text-neutral-400 dark:text-neutral-500 max-w-xl mx-auto">
            Sin instalaciones, sin configuración. Un archivo CSV o Excel es todo lo que necesitas.
            Los cálculos siguen los estándares de{' '}
            <span className="font-medium text-neutral-600 dark:text-neutral-300">
              Montgomery (Introduction to Statistical Quality Control)
            </span>{' '}
            y las reglas de Nelson (1984).
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/40"
            >
              Ir al Dashboard <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/app"
              onClick={undefined}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-600 px-8 py-3.5 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Ver demo
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20" aria-label="Características">
          <h2 className="sr-only">Características</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/30 py-16" aria-label="Cómo funciona">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 text-center mb-10">
              ¿Cómo funciona?
            </h2>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-8" role="list">
              {[
                { step: '1', title: 'Sube tus datos', body: 'Arrastra un archivo CSV o Excel con tus mediciones de proceso. Devio detecta automáticamente el formato.' },
                { step: '2', title: 'Análisis automático', body: 'El motor estadístico calcula cartas de control, detecta violaciones de las 8 reglas de Nelson y computa los índices de capacidad.' },
                { step: '3', title: 'Interpreta resultados', body: 'Visualiza las cartas, lee los puntos fuera de control y obtén recomendaciones claras para mejorar tu proceso.' },
              ].map(({ step, title, body }) => (
                <li key={step} className="relative text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg" aria-hidden>
                    {step}
                  </div>
                  <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-2">{title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20 text-center" aria-label="Llamada a la acción">
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
            Listo para analizar tu proceso?
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md mx-auto">
            No necesitas cuenta ni instalación. Solo tus datos y Devio hace el resto.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/40"
          >
            Empezar ahora <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-700 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-blue-600" aria-hidden />
            <span className="font-semibold text-neutral-600 dark:text-neutral-300">Devio</span>
            <span>— SPC para el resto de nosotros</span>
          </div>
          <nav className="flex items-center gap-6" aria-label="Footer">
            <a
              href="https://github.com/markusx5622/devio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              aria-label="Ver código fuente en GitHub"
            >
              <ExternalLink className="h-4 w-4" aria-hidden /> GitHub
            </a>
            <span>Privacidad</span>
            <span>Contacto</span>
          </nav>
        </div>
      </footer>
    </div>
  );
}
