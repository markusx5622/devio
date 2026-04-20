'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SpcTooltip } from '@/components/ui/SpcTooltip';
import {
  LineChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AnalysisResult } from '@/lib/spc/types';

type ChartVariant = 'means' | 'ranges' | 'individuals';

interface ControlChartProps {
  analysis: AnalysisResult;
  chartType: ChartVariant;
}

interface ChartPoint {
  index: number;
  value: number;
  ucl: number;
  cl: number;
  lcl: number;
  violated: boolean;
  violationLabels: string[];
}

const RULE_LABELS: Record<string, string> = {
  'nelson-1': 'Regla 1: Punto fuera de límites',
  'nelson-2': 'Regla 2: 9 puntos del mismo lado',
  'nelson-3': 'Regla 3: 6 puntos en tendencia',
  'nelson-4': 'Regla 4: 14 puntos alternando',
  'nelson-5': 'Regla 5: 2/3 puntos más allá de ±2σ',
  'nelson-6': 'Regla 6: 4/5 puntos más allá de ±1σ',
  'nelson-7': 'Regla 7: 15 puntos dentro de ±1σ',
  'nelson-8': 'Regla 8: 8 puntos fuera de ±1σ (bimodal)',
};

const CHART_TITLES: Record<ChartVariant, string> = {
  means:       'Carta de Medias (X̄)',
  ranges:      'Carta de Rangos / Desviaciones (R/S)',
  individuals: 'Carta de Individuales (I)',
};

function buildChartData(analysis: AnalysisResult, chartType: ChartVariant): ChartPoint[] {
  const { chart, violations } = analysis;

  const violationMap = new Map<number, string[]>();
  violations.forEach((v) => {
    v.subgroupIndices.forEach((idx) => {
      const existing = violationMap.get(idx) ?? [];
      existing.push(RULE_LABELS[v.rule] ?? v.rule);
      violationMap.set(idx, existing);
    });
  });

  if (chartType === 'individuals' && chart.type === 'i-mr') {
    return chart.individuals.map((m, i) => ({
      index: i + 1,
      value: m.value,
      ucl: chart.iLimits.ucl,
      cl: chart.iLimits.cl,
      lcl: chart.iLimits.lcl,
      violated: violationMap.has(i),
      violationLabels: violationMap.get(i) ?? [],
    }));
  }

  if (chartType === 'means' && (chart.type === 'xbar-r' || chart.type === 'xbar-s')) {
    return chart.subgroups.map((sg, i) => ({
      index: i + 1,
      value: sg.mean,
      ucl: chart.xbarLimits.ucl,
      cl: chart.xbarLimits.cl,
      lcl: chart.xbarLimits.lcl,
      violated: violationMap.has(i),
      violationLabels: violationMap.get(i) ?? [],
    }));
  }

  if (chartType === 'ranges') {
    if (chart.type === 'xbar-r') {
      return chart.subgroups.map((sg, i) => ({
        index: i + 1,
        value: sg.range,
        ucl: chart.rLimits.ucl,
        cl: chart.rLimits.cl,
        lcl: chart.rLimits.lcl,
        violated: false,
        violationLabels: [],
      }));
    }
    if (chart.type === 'xbar-s') {
      return chart.subgroups.map((sg, i) => ({
        index: i + 1,
        value: sg.stdDev,
        ucl: chart.sLimits.ucl,
        cl: chart.sLimits.cl,
        lcl: chart.sLimits.lcl,
        violated: false,
        violationLabels: [],
      }));
    }
    if (chart.type === 'i-mr') {
      return chart.movingRanges.map((mr, i) => ({
        index: i + 2,
        value: mr,
        ucl: chart.mrLimits.ucl,
        cl: chart.mrLimits.cl,
        lcl: chart.mrLimits.lcl,
        violated: false,
        violationLabels: [],
      }));
    }
  }

  return [];
}

// ---------------------------------------------------------------------------
// Custom dot — violation dots have a pulsing ring
// ---------------------------------------------------------------------------

function CustomDot(props: { cx?: number; cy?: number; payload?: ChartPoint }) {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !payload) return null;

  if (payload.violated) {
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={8}
          fill="none"
          stroke="#ef4444"
          strokeWidth={1.5}
          opacity={0.35}
          className="ring-pulse"
        />
        <circle cx={cx} cy={cy} r={5} fill="#ef4444" stroke="#b91c1c" strokeWidth={1} />
      </g>
    );
  }

  return <circle cx={cx} cy={cy} r={3.5} fill="#3b82f6" stroke="#1d4ed8" strokeWidth={1} />;
}

// ---------------------------------------------------------------------------
// Custom tooltip — shows sigma distance and violation details
// ---------------------------------------------------------------------------

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;

  const sigma = (point.ucl - point.cl) / 3;
  const sigmaDistance = sigma > 0 ? (point.value - point.cl) / sigma : 0;
  const sigmaStr =
    sigmaDistance >= 0
      ? `+${sigmaDistance.toFixed(1)}σ del centro`
      : `${sigmaDistance.toFixed(1)}σ del centro`;

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm p-3 shadow-lg text-xs space-y-1.5 max-w-xs">
      <p className="font-semibold text-neutral-700 dark:text-neutral-200">Punto {point.index}</p>
      <p className="font-mono text-neutral-800 dark:text-neutral-100 tabular-nums">
        Valor: <span className="font-bold">{point.value.toFixed(4)}</span>
      </p>
      <p className="text-neutral-500 dark:text-neutral-400 tabular-nums">{sigmaStr}</p>
      <div className="pt-0.5 space-y-0.5 text-neutral-400">
        <p className="tabular-nums">UCL {point.ucl.toFixed(4)}</p>
        <p className="tabular-nums">CL&nbsp; {point.cl.toFixed(4)}</p>
        <p className="tabular-nums">LCL {point.lcl.toFixed(4)}</p>
      </div>
      {point.violationLabels.length > 0 && (
        <div className="pt-1 border-t border-neutral-200 dark:border-neutral-600 space-y-0.5">
          {point.violationLabels.map((label) => (
            <p key={label} className="text-red-500 font-semibold">{label}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom reference line label with opaque background
// ---------------------------------------------------------------------------

function RefLabel({
  viewBox,
  value,
  color,
}: {
  viewBox?: { x?: number; y?: number; width?: number };
  value: string;
  color: string;
}) {
  const x = (viewBox?.x ?? 0) + (viewBox?.width ?? 0) - 2;
  const y = viewBox?.y ?? 0;
  const textWidth = value.length * 5.5 + 6;

  return (
    <g>
      <rect
        x={x - textWidth}
        y={y - 9}
        width={textWidth}
        height={13}
        fill="white"
        fillOpacity={0.88}
        rx={2}
      />
      <text x={x - 3} y={y + 2} textAnchor="end" fontSize={9} fill={color} fontWeight="600">
        {value}
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ControlChart({ analysis, chartType }: ControlChartProps) {
  const data = useMemo(() => buildChartData(analysis, chartType), [analysis, chartType]);

  if (data.length === 0) return null;

  const ucl = data[0]!.ucl;
  const cl  = data[0]!.cl;
  const lcl = data[0]!.lcl;

  const padding = (ucl - lcl) * 0.15;
  const yMin = lcl - padding;
  const yMax = ucl + padding;

  const title = CHART_TITLES[chartType];
  const violationCount = data.filter((d) => d.violated).length;

  return (
    <motion.div
      className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 p-4 space-y-3 transition-shadow duration-200"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ boxShadow: 'var(--shadow-card-hover)' }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{title}</h3>
        {violationCount > 0 ? (
          <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-300">
            {violationCount} violaciones
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
            Bajo control
          </span>
        )}
      </div>
      <div className="flex gap-4 text-xs text-neutral-500 dark:text-neutral-400">
        <span className="text-red-500"><SpcTooltip term="UCL">UCL</SpcTooltip> {ucl.toFixed(3)}</span>
        <span className="text-neutral-400"><SpcTooltip term="CL">CL</SpcTooltip> {cl.toFixed(3)}</span>
        <span className="text-orange-500"><SpcTooltip term="LCL">LCL</SpcTooltip> {lcl.toFixed(3)}</span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 56, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis
            dataKey="index"
            tick={{ fontSize: 10 }}
            label={{ value: 'Subgrupo', position: 'insideBottom', offset: -2, fontSize: 10 }}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 10 }}
            tickFormatter={(v: number) => v.toFixed(3)}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Control limit reference lines with opaque labels */}
          <ReferenceLine
            y={ucl}
            stroke="#ef4444"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            strokeOpacity={0.6}
            label={<RefLabel value={`UCL ${ucl.toFixed(3)}`} color="#ef4444" />}
          />
          <ReferenceLine
            y={cl}
            stroke="#3b82f6"
            strokeDasharray="2 2"
            strokeWidth={1.5}
            strokeOpacity={0.7}
            label={<RefLabel value={`CL ${cl.toFixed(3)}`} color="#3b82f6" />}
          />
          <ReferenceLine
            y={lcl}
            stroke="#ef4444"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            strokeOpacity={0.6}
            label={<RefLabel value={`LCL ${lcl.toFixed(3)}`} color="#f97316" />}
          />

          <Line
            type="linear"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: '#2563eb' }}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
