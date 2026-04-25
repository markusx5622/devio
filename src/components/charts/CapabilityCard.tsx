'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { useAnimatedNumber } from '@/lib/utils/useAnimatedNumber';
import type { ProcessCapability, SpecLimits } from '@/lib/spc/types';
import type { CapabilityCategory } from '@/lib/spc/capability';
import { SpcTooltip } from '@/components/ui/SpcTooltip';

const CATEGORY_CONFIG: Record<
  CapabilityCategory,
  { label: string; bg: string; text: string }
> = {
  excellent:   { label: 'Excelente',  bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-700 dark:text-green-300' },
  adequate:    { label: 'Adecuado',   bg: 'bg-blue-100 dark:bg-blue-900/30',     text: 'text-blue-700 dark:text-blue-300' },
  marginal:    { label: 'Marginal',   bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
  inadequate:  { label: 'Inadecuado', bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-700 dark:text-red-300' },
};

function categorize(v: number): CapabilityCategory {
  if (v >= 1.67) return 'excellent';
  if (v >= 1.33) return 'adequate';
  if (v >= 1.0)  return 'marginal';
  return 'inadequate';
}

// ---------------------------------------------------------------------------
// Capability badge with animated value
// ---------------------------------------------------------------------------

function CapBadge({ value }: { value: number | undefined }) {
  const animated = useAnimatedNumber(value ?? 0);

  if (value === undefined) {
    return <span className="text-sm font-mono text-neutral-400">N/A</span>;
  }
  const cat = categorize(value);
  const cfg = CATEGORY_CONFIG[cat];
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold font-mono text-neutral-800 dark:text-neutral-100 tabular-nums">
        {animated.toFixed(3)}
      </span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
    </div>
  );
}

function IndexRow({
  label,
  value,
  description,
}: {
  label: React.ReactNode;
  value: number | undefined;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700/50 last:border-0">
      <div>
        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{label}</span>
        <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
      </div>
      <CapBadge value={value} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Normal distribution helpers
// ---------------------------------------------------------------------------

function normalPdf(x: number, mu: number, sigma: number): number {
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
}

interface HistogramBin {
  xMid: number;
  count: number;
  normal: number;
}

function computeHistogram(values: readonly number[], binCount = 12): HistogramBin[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  if (span === 0) return [];

  const binWidth = span / binCount;
  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => ({
    xMid: min + (i + 0.5) * binWidth,
    count: 0,
    normal: 0,
  }));

  values.forEach((v) => {
    const idx = Math.min(Math.floor((v - min) / binWidth), binCount - 1);
    bins[idx]!.count++;
  });

  const mu = values.reduce((s, v) => s + v, 0) / values.length;
  const sigma = Math.sqrt(values.reduce((s, v) => s + (v - mu) ** 2, 0) / values.length);

  if (sigma === 0) return bins;

  const maxCount = Math.max(...bins.map((b) => b.count));
  const maxNormal = normalPdf(mu, mu, sigma);
  const scale = maxCount / maxNormal;

  bins.forEach((bin) => {
    bin.normal = normalPdf(bin.xMid, mu, sigma) * scale;
  });

  return bins;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CapabilityCardProps {
  capability: ProcessCapability;
  values?: readonly number[];
  specLimits?: SpecLimits;
}

export function CapabilityCard({ capability, values, specLimits }: CapabilityCardProps) {
  const histogram = useMemo(
    () => (values && values.length > 0 ? computeHistogram(values) : []),
    [values],
  );

  return (
    <motion.div
      className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 p-4 space-y-4 transition-shadow duration-200"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      whileHover={{ boxShadow: 'var(--shadow-card-hover)' }}
    >
      <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
        Índices de Capacidad del Proceso
      </h3>

      {specLimits && (
        <div className="flex gap-4 text-xs text-neutral-500">
          <span>USL: <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">{specLimits.usl}</span></span>
          <span>LSL: <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">{specLimits.lsl}</span></span>
          <span>Sigma: <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-300 tabular-nums">{capability.sigma.toFixed(2)}σ</span></span>
        </div>
      )}

      <div>
        <IndexRow label={<SpcTooltip term="Cp">Cp</SpcTooltip>}   value={capability.cp}  description="Capacidad potencial a corto plazo (tolerancia / 6σ̂)" />
        <IndexRow label={<SpcTooltip term="Cpk">Cpk</SpcTooltip>} value={capability.cpk} description="Capacidad real a corto plazo (considera centrado)" />
        <IndexRow label={<SpcTooltip term="Pp">Pp</SpcTooltip>}   value={capability.pp}  description="Desempeño potencial a largo plazo" />
        <IndexRow label={<SpcTooltip term="Ppk">Ppk</SpcTooltip>} value={capability.ppk} description="Desempeño real a largo plazo (considera centrado)" />
      </div>

      {histogram.length > 0 && (
        <div>
          <p className="text-xs font-medium text-neutral-400 mb-2">Distribución de datos + curva normal teórica</p>
          <ResponsiveContainer width="100%" height={140}>
            <ComposedChart data={histogram} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis
                dataKey="xMid"
                tick={{ fontSize: 9 }}
                tickFormatter={(v: number) => v.toFixed(3)}
              />
              <YAxis tick={{ fontSize: 9 }} width={28} />
              <Tooltip
                formatter={(v: number, name: string) => [
                  v.toFixed(2),
                  name === 'count' ? 'Frecuencia' : 'Normal teórica',
                ]}
                labelFormatter={(v: number) => `x = ${Number(v).toFixed(4)}`}
              />
              <Bar dataKey="count" fill="#93c5fd" opacity={0.7} radius={[2, 2, 0, 0]} />
              <Line
                type="monotone"
                dataKey="normal"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
