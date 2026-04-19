import type { Measurement, Subgroup } from '@/lib/spc/types';

// ---------------------------------------------------------------------------
// Primitive statistics — Montgomery Ch.3 / Ch.6
// ---------------------------------------------------------------------------

/** Arithmetic mean of a numeric array. */
export function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/** Range (max − min) of a numeric array. */
export function range(values: readonly number[]): number {
  if (values.length === 0) return 0;
  let lo = values[0]!;
  let hi = values[0]!;
  for (const v of values) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  return hi - lo;
}

/**
 * Sample standard deviation (divisor n − 1).
 * Returns 0 for arrays of length ≤ 1.
 */
export function stdDev(values: readonly number[]): number {
  if (values.length <= 1) return 0;
  const m = mean(values);
  const sumSq = values.reduce((s, v) => s + (v - m) ** 2, 0);
  return Math.sqrt(sumSq / (values.length - 1));
}

/**
 * Population standard deviation (divisor n).
 * Used for long-term Pp / Ppk calculations.
 */
export function stdDevPopulation(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  const sumSq = values.reduce((s, v) => s + (v - m) ** 2, 0);
  return Math.sqrt(sumSq / values.length);
}

// ---------------------------------------------------------------------------
// Moving range — used by I-MR chart
// ---------------------------------------------------------------------------

/**
 * Successive absolute differences |X_i − X_{i-1}|.
 * Result length = values.length − 1.
 * Montgomery §9.2.
 */
export function movingRanges(values: readonly number[]): readonly number[] {
  if (values.length < 2) return [];
  return values.slice(1).map((v, i) => Math.abs(v - values[i]!));
}

// ---------------------------------------------------------------------------
// Subgroup statistics — used by X̄-R and X̄-S charts
// ---------------------------------------------------------------------------

/** Compute per-subgroup statistics from raw measurement arrays. */
export function buildSubgroups(groups: readonly (readonly Measurement[])[]): readonly Subgroup[] {
  return groups.map((measurements, index) => {
    const vals = measurements.map((m) => m.value);
    return {
      index,
      measurements,
      mean: mean(vals),
      range: range(vals),
      stdDev: stdDev(vals),
    };
  });
}

/** Mean of all subgroup means (X̄̄ — "grand mean"). */
export function grandMean(subgroups: readonly Subgroup[]): number {
  return mean(subgroups.map((sg) => sg.mean));
}

/** Mean of all subgroup ranges (R̄). */
export function averageRange(subgroups: readonly Subgroup[]): number {
  return mean(subgroups.map((sg) => sg.range));
}

/** Mean of all subgroup standard deviations (s̄). */
export function averageStdDev(subgroups: readonly Subgroup[]): number {
  return mean(subgroups.map((sg) => sg.stdDev));
}

/** All individual measurement values flattened from subgroups. */
export function allValues(subgroups: readonly Subgroup[]): readonly number[] {
  return subgroups.flatMap((sg) => sg.measurements.map((m) => m.value));
}
