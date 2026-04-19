'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
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
  means: 'Carta de Medias (X̄)',
  ranges: 'Carta de Rangos / Desviaciones (R/S)',
  individuals: 'Carta de Individuales (I)',
};

function buildChartData(analysis: AnalysisResult, chartType: ChartVariant): ChartPoint[] {
  const { chart, violations } = analysis;

  // Build violation index → labels map
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
    // I-MR: show moving ranges
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

// Custom dot: red for violations, blue otherwise
function CustomDot(props: {
  cx?: number;
  cy?: number;
  payload?: ChartPoint;
  r?: number;
}) {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !payload) return <g />;

  const fill = payload.violated ? '#ef4444' : '#3b82f6';
  const r = payload.violated ? 5 : 3.5;

  return (
    <Dot cx={cx} cy={cy} r={r} fill={fill} stroke={payload.violated ? '#b91c1c' : '#1d4ed8'} strokeWidth={1} />
  );
}

// Tooltip content
function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartPoint }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 p-3 shadow-lg text-xs space-y-1 max-w-xs">
      <p className="font-semibold text-neutral-700 dark:text-neutral-200">Punto {point.index}</p>
      <p className="font-mono text-neutral-600 dark:text-neutral-300">Valor: <span className="font-bold">{point.value.toFixed(4)}</span></p>
      <p className="text-neutral-400">UCL: {point.ucl.toFixed(4)}</p>
      <p className="text-neutral-400">CL: {point.cl.toFixed(4)}</p>
      <p className="text-neutral-400">LCL: {point.lcl.toFixed(4)}</p>
      {point.violationLabels.length > 0 && (
        <div className="pt-1 border-t border-neutral-200 dark:border-neutral-600">
          {point.violationLabels.map((label) => (
            <p key={label} className="text-red-500 font-medium">{label}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export function ControlChart({ analysis, chartType }: ControlChartProps) {
  const data = useMemo(() => buildChartData(analysis, chartType), [analysis, chartType]);

  if (data.length === 0) return null;

  const ucl = data[0]!.ucl;
  const cl = data[0]!.cl;
  const lcl = data[0]!.lcl;

  const padding = (ucl - lcl) * 0.15;
  const yMin = lcl - padding;
  const yMax = ucl + padding;

  const title = CHART_TITLES[chartType];
  const violationCount = data.filter((d) => d.violated).length;

  return (
    <motion.div
      className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 p-4 space-y-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
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

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
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

          {/* Control limit reference lines */}
          <ReferenceLine y={ucl} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5}
            label={{ value: `UCL ${ucl.toFixed(3)}`, position: 'right', fontSize: 9, fill: '#ef4444' }} />
          <ReferenceLine y={cl} stroke="#6b7280" strokeDasharray="2 2" strokeWidth={1.5}
            label={{ value: `CL ${cl.toFixed(3)}`, position: 'right', fontSize: 9, fill: '#6b7280' }} />
          <ReferenceLine y={lcl} stroke="#f97316" strokeDasharray="4 3" strokeWidth={1.5}
            label={{ value: `LCL ${lcl.toFixed(3)}`, position: 'right', fontSize: 9, fill: '#f97316' }} />

          <Line
            type="linear"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: '#2563eb' }}
            isAnimationActive={true}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
