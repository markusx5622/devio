import type { Result } from '@/lib/utils/result';
import { ok, err } from '@/lib/utils/result';
import type {
  AnalysisResult,
  ControlChart,
  SpcError,
  SpecLimits,
  Measurement,
} from '@/lib/spc/types';
import type { SubgroupSize } from '@/lib/spc/constants';
import { SHEWHART_CONSTANTS } from '@/lib/spc/constants';
import { computeXbarR } from './charts/x-bar-r';
import { computeXbarS } from './charts/x-bar-s';
import { computeIMR } from './charts/i-mr';
import { detectNelsonViolations } from './rules/nelson';
import { computeCapability } from './capability/capability';
import { mean, movingRanges, averageRange, averageStdDev } from './stats/descriptive';

export type ChartInput =
  | { readonly kind: 'individual'; readonly values: readonly Measurement[] }
  | {
      readonly kind: 'subgroup';
      readonly subgroupSize: number;
      readonly subgroups: readonly (readonly Measurement[])[];
    };

export interface AnalyzeOptions {
  /** Prefer X̄-S over X̄-R when subgroup sizes are ≥ this threshold. Default: 10. */
  readonly xbarSThreshold?: number;
  /** Spec limits for capability calculation. Omit to skip capability. */
  readonly specLimits?: SpecLimits;
}

/**
 * Full SPC analysis pipeline: build chart → detect violations → compute capability.
 *
 * Chart type selection:
 *   - Individual data (n=1) → I-MR
 *   - Subgroup n ≤ threshold (default 10) → X̄-R
 *   - Subgroup n > threshold → X̄-S
 */
export function analyzeProcess(
  input: ChartInput,
  options: AnalyzeOptions = {},
): Result<AnalysisResult, SpcError> {
  const { xbarSThreshold = 10, specLimits } = options;

  // ── 1. Build control chart ──────────────────────────────────────────────
  let chartResult: Result<ControlChart, SpcError>;

  if (input.kind === 'individual') {
    chartResult = computeIMR(input.values);
  } else {
    const { subgroupSize, subgroups } = input;
    if (subgroupSize > xbarSThreshold) {
      chartResult = computeXbarS(subgroups);
    } else {
      chartResult = computeXbarR(subgroups);
    }
  }

  if (!chartResult.ok) return err(chartResult.error);
  const chart = chartResult.value;

  // ── 2. Compute σ of the plotted statistic for Nelson rules ───────────────
  const sigmaStat = plotSigma(chart);
  if (sigmaStat === null) {
    return err({ kind: 'calculation-error', message: 'Could not compute chart sigma for Nelson rules' });
  }

  // ── 3. Detect Nelson violations on the X̄ / I chart ───────────────────────
  const plotted = plottedValues(chart);
  const cl = centerLine(chart);
  const violations = detectNelsonViolations(plotted, cl, sigmaStat);

  // ── 4. Capability (optional) ─────────────────────────────────────────────
  let capability: AnalysisResult['capability'];
  if (specLimits) {
    const capResult = computeCapability(chart, specLimits);
    if (!capResult.ok) return err(capResult.error);
    capability = capResult.value;
  }

  // ── 5. Assemble result ───────────────────────────────────────────────────
  const subgroupCount =
    chart.type === 'i-mr' ? chart.individuals.length : chart.subgroups.length;
  const totalMeasurements =
    chart.type === 'i-mr'
      ? chart.individuals.length
      : chart.subgroups.reduce((s, sg) => s + sg.measurements.length, 0);

  return ok({
    chart,
    violations,
    capability,
    isInControl: violations.length === 0,
    subgroupCount,
    totalMeasurements,
  });
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function plottedValues(chart: ControlChart): readonly number[] {
  if (chart.type === 'i-mr') return chart.individuals.map((m) => m.value);
  return chart.subgroups.map((sg) => sg.mean);
}

function centerLine(chart: ControlChart): number {
  if (chart.type === 'i-mr') return chart.processMean;
  return chart.grandMean;
}

/**
 * Standard deviation of the plotted X̄ or I statistic used as σ for Nelson rules.
 *
 * X̄-R: σ_X̄ = (R̄ / d2) / √n    [Montgomery §6.2]
 * X̄-S: σ_X̄ = (s̄ / c4) / √n    [Montgomery §6.4]
 * I-MR: σ_I = MR̄ / d2           [Montgomery §9.2, d2 at n=2]
 */
function plotSigma(chart: ControlChart): number | null {
  if (chart.type === 'xbar-r') {
    const n = chart.subgroups[0]!.measurements.length as SubgroupSize;
    const d2 = SHEWHART_CONSTANTS[n].d2;
    const rBar = averageRange(chart.subgroups);
    return rBar / d2 / Math.sqrt(n);
  }
  if (chart.type === 'xbar-s') {
    const n = chart.subgroups[0]!.measurements.length as SubgroupSize;
    const c4 = SHEWHART_CONSTANTS[n].c4;
    const sBar = averageStdDev(chart.subgroups);
    return sBar / c4 / Math.sqrt(n);
  }
  // I-MR
  const vals = chart.individuals.map((m) => m.value);
  const mrs = movingRanges(vals);
  if (mrs.length === 0) return null;
  const mrBar = mean(mrs);
  const d2 = SHEWHART_CONSTANTS[2].d2;
  return mrBar / d2;
}
