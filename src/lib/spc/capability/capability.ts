import type { Result } from '@/lib/utils/result';
import { ok, err } from '@/lib/utils/result';
import type { ProcessCapability, SpecLimits, SpcError, ControlChart } from '@/lib/spc/types';
import { SHEWHART_CONSTANTS } from '@/lib/spc/constants';
import type { SubgroupSize } from '@/lib/spc/constants';
import { allValues, averageRange, averageStdDev, stdDevPopulation } from '@/lib/spc/stats/descriptive';

/**
 * Categorical interpretation of a capability index.
 * Based on Montgomery, §3.1 (process capability discussion):
 *   ≥ 1.67: Excellent
 *   ≥ 1.33: Adequate
 *   ≥ 1.00: Marginal
 *    < 1.00: Inadequate
 */
export type CapabilityCategory = 'excellent' | 'adequate' | 'marginal' | 'inadequate';

export function categorize(index: number): CapabilityCategory {
  if (index >= 1.67) return 'excellent';
  if (index >= 1.33) return 'adequate';
  if (index >= 1.00) return 'marginal';
  return 'inadequate';
}

/**
 * Compute process capability and performance indices (Cp, Cpk, Pp, Ppk).
 *
 * Formulas — Montgomery, Introduction to Statistical Quality Control, 7th ed., §3.1:
 *
 * Short-term σ̂ (within-subgroup variation):
 *   X̄-R chart: σ̂ = R̄ / d2
 *   X̄-S chart: σ̂ = s̄ / c4
 *   I-MR chart: σ̂ = MR̄ / d2  (d2 = 1.128, n=2)
 *
 * Cp  = (USL − LSL) / (6σ̂)
 * Cpk = min[(USL − X̄̄) / (3σ̂), (X̄̄ − LSL) / (3σ̂)]
 *
 * Long-term σ (overall variation — sample std dev of all observations):
 * Pp  = (USL − LSL) / (6σ)
 * Ppk = min[(USL − X̄̄) / (3σ), (X̄̄ − LSL) / (3σ)]
 *
 * Sigma level = min[(USL − X̄̄), (X̄̄ − LSL)] / σ̂
 */
export function computeCapability(
  chart: ControlChart,
  spec: SpecLimits,
): Result<ProcessCapability, SpcError> {
  if (spec.usl <= spec.lsl) {
    return err({
      kind: 'invalid-spec-limits',
      message: `USL (${spec.usl}) must be greater than LSL (${spec.lsl})`,
      usl: spec.usl,
      lsl: spec.lsl,
    });
  }

  const { usl, lsl } = spec;
  let processMean: number;
  let sigmaShort: number;
  let sigmaLong: number;

  if (chart.type === 'xbar-r') {
    const n = chart.subgroups[0]!.measurements.length as SubgroupSize;
    const d2 = SHEWHART_CONSTANTS[n].d2;
    const rBar = averageRange(chart.subgroups);
    sigmaShort = rBar / d2;
    processMean = chart.grandMean;
    sigmaLong = stdDevPopulation(allValues(chart.subgroups));
  } else if (chart.type === 'xbar-s') {
    const n = chart.subgroups[0]!.measurements.length as SubgroupSize;
    const c4 = SHEWHART_CONSTANTS[n].c4;
    const sBar = averageStdDev(chart.subgroups);
    sigmaShort = sBar / c4;
    processMean = chart.grandMean;
    sigmaLong = stdDevPopulation(allValues(chart.subgroups));
  } else {
    // I-MR: n=2 row, d2 = 1.128
    const d2 = SHEWHART_CONSTANTS[2].d2;
    sigmaShort = chart.averageMovingRange / d2;
    processMean = chart.processMean;
    sigmaLong = stdDevPopulation(chart.individuals.map((m) => m.value));
  }

  if (sigmaShort === 0 || sigmaLong === 0) {
    return err({
      kind: 'calculation-error',
      message: 'Process variation is zero — cannot compute capability indices',
    });
  }

  const tolerance = usl - lsl;

  const cp = tolerance / (6 * sigmaShort);
  const cpkAbove = (usl - processMean) / (3 * sigmaShort);
  const cpkBelow = (processMean - lsl) / (3 * sigmaShort);
  const cpk = Math.min(cpkAbove, cpkBelow);

  const pp = tolerance / (6 * sigmaLong);
  const ppkAbove = (usl - processMean) / (3 * sigmaLong);
  const ppkBelow = (processMean - lsl) / (3 * sigmaLong);
  const ppk = Math.min(ppkAbove, ppkBelow);

  const sigma = Math.min(usl - processMean, processMean - lsl) / sigmaShort;

  return ok({ cp, cpk, pp, ppk, sigma });
}
