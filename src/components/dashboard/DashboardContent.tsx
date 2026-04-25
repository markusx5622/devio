'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { UploadDropzone } from '@/components/upload/UploadDropzone';
import { ControlChart } from '@/components/charts/ControlChart';
import { CapabilityCard } from '@/components/charts/CapabilityCard';
import { ViolationTable } from '@/components/tables/ViolationTable';
import { InsightsPanel } from '@/components/ai/InsightsPanel';
import { ExportButton } from '@/components/export/ExportButton';
import { computeCapability } from '@/lib/spc';
import type { AnalysisResult, ProcessCapability } from '@/lib/spc/types';

type PageState = 'upload' | 'results';

export function DashboardContent() {
  const searchParams = useSearchParams();
  const demoParam = searchParams.get('demo');

  const [pageState, setPageState] = useState<PageState>('upload');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [extraCapability, setExtraCapability] = useState<ProcessCapability | null>(null);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(demoParam ? true : false);

  useEffect(() => {
    if (demoParam && isLoadingDemo) {
      const loadDemo = async () => {
        try {
          const res = await fetch(`/api/demo/${demoParam}`);
          if (res.ok) {
            const result = (await res.json()) as AnalysisResult;
            setAnalysis(result);
            setPageState('results');
          }
        } catch (err) {
          console.error('Error loading demo:', err);
        } finally {
          setIsLoadingDemo(false);
        }
      };
      loadDemo();
    }
  }, [demoParam, isLoadingDemo]);

  const handleSuccess = useCallback((result: AnalysisResult) => {
    setAnalysis(result);
    setExtraCapability(null);
    setPageState('results');
  }, []);

  const handleReset = useCallback(() => {
    setAnalysis(null);
    setExtraCapability(null);
    setPageState('upload');
  }, []);

  const handleAddSpecLimits = useCallback((usl: number, lsl: number) => {
    if (!analysis) return;
    const result = computeCapability(analysis.chart, { usl, lsl });
    if (result.ok) setExtraCapability(result.value);
  }, [analysis]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-50">
            Dashboard SPC
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Sube tu archivo de datos para generar cartas de control e índices de capacidad.
          </p>
        </div>
        {pageState === 'results' && (
          <div className="no-print flex items-center gap-2">
            <ExportButton />
            <motion.button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Nuevo análisis
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isLoadingDemo && (
          <motion.div
            key="loading-demo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 py-12"
          >
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                />
              ))}
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Cargando demostración...</p>
          </motion.div>
        )}

        {pageState === 'upload' && !isLoadingDemo && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl mx-auto no-print"
          >
            <UploadDropzone onSuccess={handleSuccess} />
          </motion.div>
        )}

        {pageState === 'results' && analysis && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ResultsGrid
              analysis={analysis}
              extraCapability={extraCapability}
              onAddSpecLimits={() => setShowSpecModal(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSpecModal && (
          <SpecLimitsModal
            onClose={() => setShowSpecModal(false)}
            onAdd={handleAddSpecLimits}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function extractValues(analysis: AnalysisResult): readonly number[] {
  const { chart } = analysis;
  if (chart.type === 'i-mr') return chart.individuals.map((m) => m.value);
  return allValues(chart.subgroups);
}

function allValues(subgroups: readonly (readonly number[])[]): readonly number[] {
  const values: number[] = [];
  for (const group of subgroups) {
    values.push(...group);
  }
  return values;
}

function chartLabel(analysis: AnalysisResult): string {
  const { chart } = analysis;
  if (chart.type === 'xbar-r') return 'X̄-R';
  if (chart.type === 'xbar-s') return 'X̄-S';
  return 'I-MR';
}

function AnimatedKpi({ value }: { value: number }) {
  const animated = useAnimatedNumber(value, 600);
  return (
    <span className="mt-0.5 text-lg font-bold font-mono tabular-nums text-neutral-800 dark:text-neutral-100">
      {Math.round(animated)}
    </span>
  );
}

function useAnimatedNumber(target: number, duration: number): number {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const startValue = 0;

    const updateValue = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimated(startValue + (target - startValue) * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  }, [target, duration]);

  return animated;
}

function SummaryStrip({ analysis }: { analysis: AnalysisResult }) {
  const { subgroupCount, totalMeasurements, violations, isInControl } = analysis;

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 p-4 sm:p-5"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="text-center col-span-2 sm:col-span-1">
        <p className="text-xs text-neutral-400 uppercase tracking-wide">Tipo</p>
        <p className="mt-0.5 text-lg font-bold font-mono text-neutral-800 dark:text-neutral-100">
          {chartLabel(analysis)}
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs text-neutral-400 uppercase tracking-wide">Subgrupos</p>
        <AnimatedKpi value={subgroupCount} />
      </div>
      <div className="text-center">
        <p className="text-xs text-neutral-400 uppercase tracking-wide">Mediciones</p>
        <AnimatedKpi value={totalMeasurements} />
      </div>
      <div className="text-center">
        <p className="text-xs text-neutral-400 uppercase tracking-wide">Violaciones</p>
        <AnimatedKpi value={violations.length} />
      </div>
      <div className="text-center col-span-2 sm:col-span-1">
        <p className="text-xs text-neutral-400 uppercase tracking-wide">Estado</p>
        {isInControl ? (
          <span className="mt-0.5 flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" aria-hidden />
            <span className="text-sm font-bold font-mono text-green-600 dark:text-green-400">Bajo control</span>
          </span>
        ) : (
          <span className="mt-0.5 flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 urgency-pulse shrink-0" aria-hidden />
            <span className="text-sm font-bold font-mono text-red-600 dark:text-red-400">Fuera de control</span>
          </span>
        )}
      </div>
    </motion.div>
  );
}

function ResultSection({
  children,
  delay = 0,
  label,
}: {
  children: React.ReactNode;
  delay?: number;
  label?: string;
}) {
  return (
    <motion.section
      aria-label={label}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );
}

function ResultsGrid({
  analysis,
  extraCapability,
  onAddSpecLimits,
}: {
  analysis: AnalysisResult;
  extraCapability: ProcessCapability | null;
  onAddSpecLimits: () => void;
}) {
  const { chart } = analysis;
  const rawValues = extractValues(analysis);
  const capability = analysis.capability ?? extraCapability ?? null;

  return (
    <div className="space-y-6 sm:space-y-8">
      <SummaryStrip analysis={analysis} />

      <ResultSection label="Cartas de control" delay={0}>
        <h2 className="text-base sm:text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-4 sm:mb-5">
          Cartas de Control
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
          {(chart.type === 'xbar-r' || chart.type === 'xbar-s') && (
            <>
              <ControlChart analysis={analysis} chartType="means" />
              <ControlChart analysis={analysis} chartType="ranges" />
            </>
          )}
          {chart.type === 'i-mr' && (
            <>
              <ControlChart analysis={analysis} chartType="individuals" />
              <ControlChart analysis={analysis} chartType="ranges" />
            </>
          )}
        </div>
      </ResultSection>

      <ResultSection delay={0.15}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
          {capability ? (
            <section aria-label="Capacidad del proceso">
              <CapabilityCard capability={capability} values={rawValues} />
            </section>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-center text-center">
              <div className="space-y-3">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Índices de capacidad no disponibles
                </p>
                <p className="text-xs text-neutral-400 max-w-xs">
                  Introduce límites de especificación (USL/LSL) en el análisis para calcular Cp y Cpk.
                </p>
                <button
                  type="button"
                  onClick={onAddSpecLimits}
                  className="no-print inline-flex items-center gap-2 rounded-lg border border-blue-300 dark:border-blue-700 px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                >
                  Añadir límites
                </button>
              </div>
            </div>
          )}

          <section aria-label="Violaciones de reglas Nelson">
            <ViolationTable violations={analysis.violations} />
          </section>
        </div>
      </ResultSection>

      <ResultSection label="Análisis con inteligencia artificial" delay={0.3}>
        <InsightsPanel analysis={analysis} />
      </ResultSection>
    </div>
  );
}

function SpecLimitsModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (usl: number, lsl: number) => void;
}) {
  const [usl, setUsl] = useState('');
  const [lsl, setLsl] = useState('');
  const [err, setErr] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const u = parseFloat(usl);
    const l = parseFloat(lsl);
    if (isNaN(u) || isNaN(l)) {
      setErr('Introduce valores numéricos válidos.');
      return;
    }
    if (u <= l) {
      setErr('USL debe ser mayor que LSL.');
      return;
    }
    onAdd(u, l);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        className="relative bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ✕
        </button>
        <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
          Añadir límites de especificación
        </h2>
        <p className="text-xs text-neutral-500 mb-4">
          Introduce USL y LSL para calcular Cp, Cpk, Pp y Ppk.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
              USL (Límite Superior de Especificación)
            </label>
            <input
              type="number"
              step="any"
              value={usl}
              onChange={(e) => {
                setUsl(e.target.value);
                setErr('');
              }}
              placeholder="Ej: 10.8"
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
              LSL (Límite Inferior de Especificación)
            </label>
            <input
              type="number"
              step="any"
              value={lsl}
              onChange={(e) => {
                setLsl(e.target.value);
                setErr('');
              }}
              placeholder="Ej: 9.2"
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <button
            type="submit"
            data-primary
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Calcular capacidad
          </button>
        </form>
      </motion.div>
    </div>
  );
}
