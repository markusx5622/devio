'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BarChart2,
  ShieldCheck,
  Zap,
  GitBranch,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: Zap,
    title: 'Análisis automático',
    description:
      'Sube un CSV o Excel y Devio detecta automáticamente si tus datos son individuales o subgrupos. Selecciona la carta de control adecuada (X̄-R, X̄-S o I-MR) sin configuración manual.',
    order: '01',
  },
  {
    icon: ShieldCheck,
    title: 'Reglas de Nelson',
    description:
      'Las 8 reglas de Nelson se aplican automáticamente para identificar patrones no aleatorios: tendencias, estratificación, mezcla y causas asignables, con explicaciones en lenguaje claro.',
    order: '02',
  },
  {
    icon: GitBranch,
    title: 'Capacidad de proceso',
    description:
      'Calcula Cp, Cpk (corto plazo) y Pp, Ppk (largo plazo) con interpretación categórica. Incluye histograma de distribución con curva normal teórica para validación visual.',
    order: '03',
  },
];

const STEPS = [
  {
    step: '1',
    title: 'Sube tus datos',
    body: 'Arrastra un archivo CSV o Excel con tus mediciones de proceso. Devio detecta automáticamente el formato.',
  },
  {
    step: '2',
    title: 'Análisis automático',
    body: 'El motor estadístico calcula cartas de control, detecta violaciones de las 8 reglas de Nelson y computa los índices de capacidad.',
  },
  {
    step: '3',
    title: 'Interpreta resultados',
    body: 'Visualiza las cartas, lee los puntos fuera de control y obtén recomendaciones claras para mejorar tu proceso.',
  },
];

// ---------------------------------------------------------------------------
// Scroll-based header
// ---------------------------------------------------------------------------

function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 0);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={[
        'sticky top-0 z-50 transition-all duration-200',
        scrolled
          ? 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-700/50 shadow-sm'
          : 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700',
      ].join(' ')}
    >
      <div className="mx-auto w-11/12 flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
          <motion.div
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <BarChart2 className="h-5 w-5 text-blue-600" aria-hidden />
          </motion.div>
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
  );
}

// ---------------------------------------------------------------------------
// Animated hero title — word-by-word stagger
// ---------------------------------------------------------------------------

function HeroTitle() {
  const words = ['Devio', '—', 'Control', 'Estadístico', 'de', 'Procesos'];
  const accent = ['para', 'el', 'resto', 'de', 'nosotros'];

  return (
    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 * i, ease: [0.4, 0, 0.2, 1] }}
        >
          {word === '—' ? <span className="hidden sm:inline">{word}</span> : word}
        </motion.span>
      ))}
      <br className="hidden sm:block" />
      <span className="text-blue-600 dark:text-blue-400">
        {accent.map((word, i) => (
          <motion.span
            key={i}
            className="inline-block mr-[0.25em]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 * (words.length + i), ease: [0.4, 0, 0.2, 1] }}
          >
            {word}
          </motion.span>
        ))}
      </span>
    </h1>
  );
}

// ---------------------------------------------------------------------------
// Feature card with hover elevation
// ---------------------------------------------------------------------------

function FeatureCard({
  icon: Icon,
  title,
  description,
  order,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  order: string;
}) {
  return (
    <motion.div
      className="relative rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 p-6 space-y-3 cursor-default"
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <span className="absolute top-4 right-4 text-xs font-bold text-neutral-200 dark:text-neutral-700 tabular-nums">
        {order}
      </span>
      <motion.div
        className="inline-flex items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2.5"
        whileHover={{ rotate: 5 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden />
      </motion.div>
      <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">{title}</h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// "Cómo funciona" section with animated connector line
// ---------------------------------------------------------------------------

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      className="border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/30 py-16"
      aria-label="Cómo funciona"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mx-auto w-11/12">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-100 text-center mb-12 sm:mb-16">
          ¿Cómo funciona?
        </h2>

        {/* Connector line (desktop) */}
        <div className="relative">
          <div className="hidden sm:block absolute top-6 left-[16.66%] right-[16.66%] h-px overflow-hidden">
            <motion.div
              className="h-full bg-blue-200 dark:bg-blue-800"
              initial={{ scaleX: 0, originX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            />
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative" role="list">
            {STEPS.map(({ step, title, body }, i) => (
              <motion.li
                key={step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.15, ease: 'easeOut' }}
              >
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg relative z-10"
                  aria-hidden
                >
                  {step}
                </div>
                <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </motion.section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LandingPage() {
  const featuresRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' });
  const ctaInView = useInView(ctaRef, { once: true, margin: '-100px' });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <LandingHeader />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section
          className="mx-auto w-11/12 pt-20 pb-16 text-center"
          aria-label="Introducción"
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Zap className="h-3 w-3" aria-hidden /> Control Estadístico de Procesos
          </motion.div>

          <HeroTitle />

          <motion.p
            className="mt-6 text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            El Control Estadístico de Procesos (SPC) es la disciplina que permite distinguir la
            variación normal de un proceso de las señales que indican que algo ha cambiado. Devio lo
            hace accesible: sube tus datos, obtén cartas de control, violaciones de reglas y
            capacidad de proceso en segundos.
          </motion.p>

          <motion.p
            className="mt-4 text-base text-neutral-400 dark:text-neutral-500 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.38 }}
          >
            Sin instalaciones, sin configuración. Un archivo CSV o Excel es todo lo que necesitas.
            Los cálculos siguen los estándares de{' '}
            <span className="font-medium text-neutral-600 dark:text-neutral-300">
              Montgomery (Introduction to Statistical Quality Control)
            </span>{' '}
            y las reglas de Nelson (1984).
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 dark:shadow-blue-900/40 group"
              >
                Ir al Dashboard
                <motion.span
                  className="inline-flex"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </motion.span>
              </Link>
            </motion.div>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-600 px-8 py-4 text-base font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Ver demo
            </Link>
          </motion.div>
        </section>

        {/* ── Features ── */}
        <motion.section
          ref={featuresRef}
          className="mx-auto w-11/12 pb-20"
          aria-label="Características"
          initial={{ opacity: 0, y: 24 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="sr-only">Características</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
              >
                <FeatureCard {...f} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── How it works ── */}
        <HowItWorks />

        {/* ── Bottom CTA ── */}
        <motion.section
          ref={ctaRef}
          className="mx-auto w-11/12 py-20 text-center"
          aria-label="Llamada a la acción"
          initial={{ opacity: 0, y: 24 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
            ¿Listo para analizar tu proceso?
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md mx-auto">
            No necesitas cuenta ni instalación. Solo tus datos y Devio hace el resto.
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-blue-900/40"
            >
              Empezar ahora
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </motion.div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-700 py-8">
        <div className="mx-auto w-11/12 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
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
