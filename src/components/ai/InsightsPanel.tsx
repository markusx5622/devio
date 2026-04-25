'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  Lightbulb,
  Target,
  BarChart2,
  Settings,
  Package,
  ClipboardList,
  User,
  Thermometer,
  Ruler,
} from 'lucide-react';
import type { AnalysisResult } from '@/lib/spc/types';
import type { SpcInsights } from '@/lib/ai/types';

// ---------------------------------------------------------------------------
// 6M icon mapping
// ---------------------------------------------------------------------------

const SIX_M: Array<{ keywords: string[]; icon: typeof Settings; label: string; color: string }> = [
  { keywords: ['máquina', 'machine', 'equipo', 'equipment', 'herramienta'], icon: Settings,      label: 'Máquina',       color: 'text-gray-500' },
  { keywords: ['material', 'materia prima', 'insumo'],                       icon: Package,       label: 'Material',      color: 'text-amber-500' },
  { keywords: ['método', 'method', 'proceso', 'procedimiento'],              icon: ClipboardList, label: 'Método',        color: 'text-blue-500' },
  { keywords: ['mano de obra', 'operador', 'operario', 'personal', 'human'], icon: User,          label: 'Mano de obra',  color: 'text-purple-500' },
  { keywords: ['medio ambiente', 'ambiente', 'temperatura', 'humedad'],      icon: Thermometer,   label: 'Medio ambiente', color: 'text-green-500' },
  { keywords: ['medición', 'medida', 'calibración', 'measurement'],          icon: Ruler,         label: 'Medición',      color: 'text-indigo-500' },
];

function get6MIcon(cause: string): typeof Settings | null {
  const lower = cause.toLowerCase();
  for (const { keywords, icon } of SIX_M) {
    if (keywords.some((kw) => lower.includes(kw))) return icon;
  }
  return null;
}

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
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 urgency-pulse shrink-0" aria-hidden />
        Acción Inmediata
      </span>
    );
  }
  if (urgency === 'monitor') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 text-xs font-semibold text-yellow-700 dark:text-yellow-300">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 urgency-pulse-slow shrink-0" aria-hidden />
        Monitorear
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-300">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      Aceptable
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

// ---------------------------------------------------------------------------
// DMAIC step config (shared by stepper and section labels)
// ---------------------------------------------------------------------------

const DMAIC_STEPS = [
  { label: 'D', full: 'Definir',   color: 'bg-purple-500', textColor: 'text-purple-600 dark:text-purple-400' },
  { label: 'M', full: 'Medir',     color: 'bg-blue-500',   textColor: 'text-blue-600 dark:text-blue-400' },
  { label: 'A', full: 'Analizar',  color: 'bg-cyan-500',   textColor: 'text-cyan-600 dark:text-cyan-400' },
  { label: 'I', full: 'Mejorar',   color: 'bg-amber-500',  textColor: 'text-amber-600 dark:text-amber-400' },
  { label: 'C', full: 'Controlar', color: 'bg-green-500',  textColor: 'text-green-600 dark:text-green-400' },
] as const;

// ---------------------------------------------------------------------------
// Collapsible DMAIC section
// ---------------------------------------------------------------------------

function DmaicSection({
  label,
  text,
  defaultOpen = false,
}: {
  label: string;
  text: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-100 dark:border-neutral-700/50 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-2.5 text-xs hover:bg-neutral-50/60 dark:hover:bg-neutral-700/20 transition-colors duration-100 px-1 rounded"
      >
        <span className={`font-bold w-16 text-left shrink-0 ${DMAIC_STEPS.find(s => s.full === label)?.textColor ?? 'text-blue-600 dark:text-blue-400'}`}>
          {label}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400" aria-hidden />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="text-xs text-neutral-600 dark:text-neutral-300 pb-3 px-1 leading-relaxed">
              {text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Violation card with 6M badge chips
// ---------------------------------------------------------------------------

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
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
            Causas raíz potenciales (6M)
          </p>
          <ul className="space-y-1.5">
            {violation.rootCauses.map((cause, i) => {
              const Icon = get6MIcon(cause);
              return (
                <li key={i} className="text-xs text-neutral-600 dark:text-neutral-300 flex items-start gap-1.5">
                  {Icon ? (
                    <Icon className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${SIX_M.find((m) => m.icon === Icon)?.color ?? 'text-neutral-400'}`} aria-hidden />
                  ) : (
                    <span className="text-orange-400 mt-0.5 shrink-0">▸</span>
                  )}
                  {cause}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
            Acciones correctivas
          </p>
          <ul className="space-y-1.5">
            {violation.actions.map((action, i) => (
              <li key={i} className="text-xs text-neutral-600 dark:text-neutral-300 flex gap-1.5">
                <span className="text-blue-400 mt-0.5 shrink-0">▸</span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DMAIC progress stepper
// ---------------------------------------------------------------------------

function DmaicProgress() {
  return (
    <div className="flex items-start mb-4">
      {DMAIC_STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={`h-6 w-6 rounded-full ${step.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
              {step.label}
            </div>
            <span className="text-[9px] text-neutral-400 mt-0.5 hidden sm:block">{step.full}</span>
          </div>
          {i < 4 && <div className="h-0.5 flex-1 bg-neutral-200 dark:bg-neutral-700 -mt-3" />}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Collapsible section wrapper (for Capability)
// ---------------------------------------------------------------------------

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
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-neutral-400" aria-hidden />
        </motion.span>
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
      setState({ status: 'error', message: 'Error de red al obtener el informe SPC.' });
    }
  }, [analysis]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return (
    <motion.div
      className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 overflow-hidden transition-shadow duration-200"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      whileHover={{ boxShadow: 'var(--shadow-card-hover)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-700 flex items-center bg-neutral-50/60 dark:bg-neutral-700/20">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" aria-hidden />
          Informe SPC
        </h3>
      </div>

      <div className="p-4 max-h-[60vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {state.status === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-6"
            >
              <div className="skeleton h-3 rounded-full w-3/4 mb-3" />
              <div className="skeleton h-3 rounded-full w-full mb-3" />
              <div className="skeleton h-3 rounded-full w-5/6" />
            </motion.div>
          )}

          {state.status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 py-6 text-sm text-red-500"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
              {state.message}
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

              {/* DMAIC — individually collapsible sections */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-700 flex items-center gap-2 bg-neutral-50/60 dark:bg-neutral-700/20">
                  <Target className="h-4 w-4 text-blue-500" aria-hidden />
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Plan DMAIC</span>
                </div>
                <div className="px-4 pt-3 pb-1">
                  <DmaicProgress />
                  <DmaicSection label="Definir"   text={state.data.dmaic.define}   defaultOpen />
                  <DmaicSection label="Medir"     text={state.data.dmaic.measure} />
                  <DmaicSection label="Analizar"  text={state.data.dmaic.analyze} />
                  <DmaicSection label="Mejorar"   text={state.data.dmaic.improve} />
                  <DmaicSection label="Controlar" text={state.data.dmaic.control} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
