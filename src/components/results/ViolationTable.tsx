'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronUp, ChevronDown, AlertTriangle, XCircle } from 'lucide-react';
import type { Violation, ViolationRule } from '@/lib/spc/types';
import { SpcTooltip } from '@/components/ui/SpcTooltip';

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const RULE_NAMES: Record<ViolationRule, string> = {
  'nelson-1': 'Nelson 1',
  'nelson-2': 'Nelson 2',
  'nelson-3': 'Nelson 3',
  'nelson-4': 'Nelson 4',
  'nelson-5': 'Nelson 5',
  'nelson-6': 'Nelson 6',
  'nelson-7': 'Nelson 7',
  'nelson-8': 'Nelson 8',
};

const RULE_DESCRIPTIONS: Record<ViolationRule, string> = {
  'nelson-1': 'Un punto cae fuera de los límites de control (±3σ). Señal de una causa asignable inmediata que requiere investigación urgente.',
  'nelson-2': '9 puntos consecutivos del mismo lado de la línea central. Indica un desplazamiento sostenido en la media del proceso.',
  'nelson-3': '6 puntos consecutivos en tendencia estrictamente ascendente o descendente. Indica una deriva sistemática en el proceso.',
  'nelson-4': '14 puntos alternando continuamente hacia arriba y hacia abajo. Puede indicar mezcla de dos fuentes de variación.',
  'nelson-5': '2 de 3 puntos consecutivos más allá de ±2σ en el mismo lado. Señal de un desplazamiento moderado en la media.',
  'nelson-6': '4 de 5 puntos consecutivos más allá de ±1σ en el mismo lado. Indica un desplazamiento menor pero sostenido del proceso.',
  'nelson-7': '15 puntos consecutivos dentro de ±1σ. El proceso se comporta demasiado uniforme; puede indicar estratificación o límites incorrectos.',
  'nelson-8': '8 puntos consecutivos más allá de ±1σ a ambos lados. Sugiere una distribución bimodal o mezcla de dos procesos distintos.',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortKey = 'rule' | 'points' | 'severity';
type SortDir = 'asc' | 'desc';

function severity(v: Violation): number {
  return v.subgroupIndices.length;
}

function sortViolations(
  violations: Violation[],
  key: SortKey,
  dir: SortDir,
): Violation[] {
  const sign = dir === 'asc' ? 1 : -1;
  return [...violations].sort((a, b) => {
    if (key === 'rule') return sign * a.rule.localeCompare(b.rule);
    if (key === 'points') return sign * (a.subgroupIndices.length - b.subgroupIndices.length);
    if (key === 'severity') return sign * (severity(a) - severity(b));
    return 0;
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronUp className="h-3 w-3 text-neutral-300" />;
  return dir === 'asc'
    ? <ChevronUp className="h-3 w-3 text-blue-500" />
    : <ChevronDown className="h-3 w-3 text-blue-500" />;
}

function SeverityBadge({ points }: { points: number }) {
  if (points >= 6) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300">
        <XCircle className="h-3 w-3" aria-hidden /> Alta
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-300">
      <AlertTriangle className="h-3 w-3" aria-hidden /> Media
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ViolationTableProps {
  violations: readonly Violation[];
}

export function ViolationTable({ violations }: ViolationTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('rule');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const sorted = useMemo(
    () => sortViolations([...violations], sortKey, sortDir),
    [violations, sortKey, sortDir],
  );

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function headerProps(key: SortKey) {
    return {
      onClick: () => handleSort(key),
      role: 'button' as const,
      'aria-sort': (sortKey === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none') as
        | 'ascending'
        | 'descending'
        | 'none',
      className:
        'px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide cursor-pointer select-none hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors',
    };
  }

  return (
    <motion.div
      className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Violaciones de Reglas Nelson
        </h3>
        {violations.length === 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Sin violaciones
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-300">
            {violations.length} violación{violations.length !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {violations.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-2 py-12 text-center"
          >
            <CheckCircle2 className="h-10 w-10 text-green-400" aria-hidden />
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              Proceso bajo control estadístico — Sin violaciones detectadas
            </p>
            <p className="text-xs text-neutral-400 max-w-xs">
              Las 8 reglas de Nelson no detectaron ningún patrón no aleatorio en el proceso.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {violations.length > 4 && (
              <p className="px-4 pt-2 pb-1 text-xs text-neutral-400 dark:text-neutral-500">
                {violations.length} violaciones detectadas · Desplázate para ver todas
              </p>
            )}
            <div className="max-h-96 overflow-y-auto overflow-x-auto">
            <table className="w-full text-sm" role="grid" aria-label="Tabla de violaciones de reglas Nelson">
              <thead className="sticky top-0 bg-neutral-50 dark:bg-neutral-800 z-10">
                <tr>
                  <th {...headerProps('rule')}>
                    <span className="inline-flex items-center gap-1">
                      Regla <SortIcon active={sortKey === 'rule'} dir={sortDir} />
                    </span>
                  </th>
                  {/* "Points" column hidden on mobile via hidden sm:table-cell */}
                  <th {...headerProps('points')} className={headerProps('points').className + ' hidden sm:table-cell'}>
                    <span className="inline-flex items-center gap-1">
                      Puntos <SortIcon active={sortKey === 'points'} dir={sortDir} />
                    </span>
                  </th>
                  <th {...headerProps('severity')}>
                    <span className="inline-flex items-center gap-1">
                      Severidad <SortIcon active={sortKey === 'severity'} dir={sortDir} />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide hidden md:table-cell">
                    Descripción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700/50">
                {sorted.map((v, i) => (
                  <motion.tr
                    key={`${v.rule}-${i}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-700/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-200 whitespace-nowrap">
                      <SpcTooltip term={RULE_NAMES[v.rule]}>{RULE_NAMES[v.rule]}</SpcTooltip>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-500 dark:text-neutral-400 hidden sm:table-cell">
                      {v.subgroupIndices.map((idx) => idx + 1).join(', ')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <SeverityBadge points={v.subgroupIndices.length} />
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400 hidden md:table-cell max-w-sm">
                      {RULE_DESCRIPTIONS[v.rule]}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
