'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, RotateCcw } from 'lucide-react';
import type { AnalysisResult, SpecLimits } from '@/lib/spc/types';
import { allValues } from '@/lib/spc/stats';
import { UploadDropzone } from '@/components/upload/UploadDropzone';
import { ControlChart } from '@/components/charts/ControlChart';
import { CapabilityCard } from '@/components/charts/CapabilityCard';
import { ViolationTable } from '@/components/results/ViolationTable';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractValues(analysis: AnalysisResult): readonly number[] {
  const { chart } = analysis;
  if (chart.type === 'i-mr') return chart.individuals.map((m) => m.value);
  return allValues(chart.subgroups);
}

function extractSpecLimits(analysis: AnalysisResult): SpecLimits | undefined {
  return analysis.capability ? undefined : undefined; // spec limits not stored in result
}

function chartLabel(analysis: AnalysisResult): string {
  const { chart } = analysis;
  if (chart.type === 'xbar-r') return 'X̄-R';
  if (chart.type === 'xbar-s') return 'X̄-S';
  return 'I-MR';
}

// ---------------------------------------------------------------------------
// Summary strip
// ---------------------------------------------------------------------------

function SummaryStrip({ analysis }: { analysis: AnalysisResult }) {
  const { subgroupCount, totalMeasurements, violations, isInControl } = analysis;
  const items = [
    { label: 'Tipo de carta', value: chartLabel(analysis) },
    { label: 'Subgrupos', value: String(subgroupCount) },
    { label: 'Mediciones', value: String(totalMeasurements) },
    { label: 'Violaciones', value: String(violations.length) },
    {
      label: 'Estado',
      value: isInControl ? 'Bajo control' : 'Fuera de control',
      highlight: isInControl ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-5 gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 p-4"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {items.map(({ label, value, highlight }) => (
        <div key={label} className="text-center">
          <p className="text-xs text-neutral-400 uppercase tracking-wide">{label}</p>
          <p className={`mt-0.5 text-lg font-bold font-mono ${highlight ?? 'text-neutral-800 dark:text-neutral-100'}`}>
            {value}
          </p>
        </div>
      ))}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Results grid
// ---------------------------------------------------------------------------

function ResultsGrid({ analysis }: { analysis: AnalysisResult }) {
  const { chart } = analysis;
  const rawValues = extractValues(analysis);

  return (
    <div className="space-y-6">
      <SummaryStrip analysis={analysis} />

      {/* Control charts */}
      <section aria-label="Cartas de control">
        <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-200 mb-3">
          Cartas de Control
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
      </section>

      {/* Capability + Violations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {analysis.capability ? (
          <section aria-label="Capacidad del proceso">
            <CapabilityCard
              capability={analysis.capability}
              values={rawValues}
            />
          </section>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-center text-center">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Índices de capacidad no disponibles
              </p>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                Proporciona USL y LSL en la carga del archivo para calcular Cp, Cpk, Pp y Ppk.
              </p>
            </div>
          </div>
        )}

        <section aria-label="Violaciones de reglas Nelson">
          <ViolationTable violations={analysis.violations} />
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type PageState = 'upload' | 'results';

export default function DashboardPage() {
  const [pageState, setPageState] = useState<PageState>('upload');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleSuccess = useCallback((result: AnalysisResult) => {
    setAnalysis(result);
    setPageState('results');
  }, []);

  const handleReset = useCallback(() => {
    setAnalysis(null);
    setPageState('upload');
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Dashboard SPC
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Sube tu archivo de datos para generar cartas de control e índices de capacidad.
          </p>
        </div>
        {pageState === 'results' && (
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
        )}
      </div>

      <AnimatePresence mode="wait">
        {pageState === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <UploadDropzone onSuccess={handleSuccess} />
          </motion.div>
        )}

        {pageState === 'results' && analysis && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <ResultsGrid analysis={analysis} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
