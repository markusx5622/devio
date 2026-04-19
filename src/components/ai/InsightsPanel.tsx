'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  BarChart2,
} from 'lucide-react';
import type { AnalysisResult } from '@/lib/spc/types';
import type { SpcInsights } from '@/lib/ai/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: SpcInsights }
  | { status: 'error'; message: string };

function UrgencyBadge({ urgency }: { urgency: SpcInsights['urgency'] }) {
  if (urgency === 'immediate') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Acción Inmediata
      </span>
    );
  }
  if (urgency === 'monitor') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 text-xs font-semibold text-yellow-700 dark:text-yellow-300">
        <Clock className="h-3.5 w-3.5" aria-hidden /> Monitorear
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-300">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Aceptable
    </span>
  );
}

function StatusBadge({ status }: { status: SpcInsights['processStatus'] }) {
  if (status === 'out-of-control') {
    return (
      <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
        Fuera de control
      </span>
    );
  }
  if (status === 'marginally-stable') {
    return (
      <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded">
        Marginalmente estable
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
      Bajo control
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
      <div className="space-y-2 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
        ))}
      </div>
      <div className="h-24 bg-neutral-100 dark:bg-neutral-800 rounded-lg mt-4" />
    </div>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors"
      >
        <span className="inline-flex items-center gap-2">
          <Icon className="h-4 w-4 text-blue-500" aria-hidden />
          {title}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-neutral-400" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-400" aria-hidden />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ViolationCard({
  violation,
}: {
  violation: SpcInsights['violations'][number];
}) {
  return (
    <div className="rounded-lg border border-neutral-100 dark:border-neutral-700/50 bg-neutral-50 dark:bg-neutral-800/40 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Regla Nelson {violation.rule}
        </span>
      </div>
      <p className="text-sm text-neutral-700 dark:text-neutral-200">{violation.interpretation}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
            Causas raíz potenciales (6M)
          </p>
          <ul className="space-y-1">
            {violation.rootCauses.map((cause, i) => (
              <li key={i} className="text-xs text-neutral-600 dark:text-neutral-300 flex gap-1.5">
                <span className="text-orange-400 mt-0.5">▸</span>
                {cause}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
            Acciones correctivas
          </p>
          <ul className="space-y-1">
            {violation.actions.map((action, i) => (
              <li key={i} className="text-xs text-neutral-600 dark:text-neutral-300 flex gap-1.5">
                <span className="text-blue-400 mt-0.5">▸</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DmaicRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-neutral-100 dark:border-neutral-700/50 last:border-0">
      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 w-16 shrink-0 mt-0.5">
        {label}
      </span>
      <p className="text-xs text-neutral-600 dark:text-neutral-300">{text}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface InsightsPanelProps {
  analysis: AnalysisResult;
}

export function InsightsPanel({ analysis }: InsightsPanelProps) {
  const [state, setState] = useState<FetchState>({ status: 'idle' });

  const fetchInsights = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysis),
      });
      const json = (await res.json()) as
        | { ok: true; data: SpcInsights }
        | { ok: false; error: { message: string } };

      if (!json.ok) {
        setState({ status: 'error', message: json.error.message });
        return;
      }
      setState({ status: 'success', data: json.data });
    } catch {
      setState({ status: 'error', message: 'Error de red al obtener análisis de IA.' });
    }
  }, [analysis]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return (
    <motion.div
      className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" aria-hidden />
          Análisis con IA
        </h3>
        {state.status !== 'loading' && (
          <button
            type="button"
            onClick={fetchInsights}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            aria-label="Regenerar análisis"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Regenerar
          </button>
        )}
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {state.status === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingSkeleton />
            </motion.div>
          )}

          {state.status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-8 text-center"
            >
              <AlertTriangle className="h-10 w-10 text-orange-400" aria-hidden />
              <p className="text-sm text-neutral-600 dark:text-neutral-300">{state.message}</p>
              <button
                type="button"
                onClick={fetchInsights}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Reintentar
              </button>
            </motion.div>
          )}

          {state.status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Summary + badges */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <StatusBadge status={state.data.processStatus} />
                  <UrgencyBadge urgency={state.data.urgency} />
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed">
                  {state.data.summary}
                </p>
              </div>

              {/* Violations */}
              {state.data.violations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    Interpretación de Violaciones
                  </h4>
                  {state.data.violations.map((v) => (
                    <ViolationCard key={v.rule} violation={v} />
                  ))}
                </div>
              )}

              {/* Capability */}
              {state.data.capability.assessment && (
                <CollapsibleSection title="Capacidad del Proceso" icon={BarChart2} defaultOpen>
                  <div className="space-y-2 text-sm">
                    <p className="text-neutral-700 dark:text-neutral-200">{state.data.capability.assessment}</p>
                    <div className="flex gap-2 mt-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" aria-hidden />
                      <p className="text-neutral-600 dark:text-neutral-300 text-xs">{state.data.capability.recommendation}</p>
                    </div>
                  </div>
                </CollapsibleSection>
              )}

              {/* DMAIC */}
              <CollapsibleSection title="Plan DMAIC" icon={Target}>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-700/50">
                  <DmaicRow label="Definir" text={state.data.dmaic.define} />
                  <DmaicRow label="Medir" text={state.data.dmaic.measure} />
                  <DmaicRow label="Analizar" text={state.data.dmaic.analyze} />
                  <DmaicRow label="Mejorar" text={state.data.dmaic.improve} />
                  <DmaicRow label="Controlar" text={state.data.dmaic.control} />
                </div>
              </CollapsibleSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
