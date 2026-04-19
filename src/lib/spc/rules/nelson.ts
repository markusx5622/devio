import type { Violation, ViolationRule } from '@/lib/spc/types';

/**
 * Detect Nelson (1984) out-of-control rules on a series of plotted values.
 *
 * All eight rules are implemented per:
 *   Nelson, L.S. "The Shewhart Control Chart — Tests for Special Causes."
 *   Journal of Quality Technology 16(4), 1984, pp. 237–239.
 *
 * Zone thresholds (σ = process standard deviation, CL = center line):
 *   Zone A: |x − CL| > 2σ  (beyond ±2σ)
 *   Zone B: |x − CL| > 1σ  (beyond ±1σ)
 *   Zone C: |x − CL| ≤ 1σ  (within ±1σ)
 *   Outside limits: |x − CL| > 3σ
 *
 * @param values  The plotted statistic values (means, ranges, individuals…).
 * @param cl      Center line value.
 * @param sigma   Standard deviation of the plotted statistic (NOT the process σ).
 *                For X̄ chart: σ_X̄ = R̄ / (d2 · √n).
 *                For I chart: σ_I  = MR̄ / d2 (d2 at n=2 = 1.128).
 */
export function detectNelsonViolations(
  values: readonly number[],
  cl: number,
  sigma: number,
): readonly Violation[] {
  const violations: Violation[] = [];

  const push = (rule: ViolationRule, indices: number[], descr: string) => {
    violations.push({ rule, subgroupIndices: indices, description: descr });
  };

  // Pre-compute signed zone: positive = above CL, negative = below
  const dev = values.map((v) => (v - cl) / sigma); // deviations in sigma units

  // --- Rule 1: 1 point beyond ±3σ ---
  for (let i = 0; i < values.length; i++) {
    if (Math.abs(dev[i]!) > 3) {
      push('nelson-1', [i], 'One point beyond 3σ control limit');
    }
  }

  // --- Rule 2: 9 or more consecutive points on the same side of CL ---
  for (let i = 8; i < values.length; i++) {
    const window = dev.slice(i - 8, i + 1);
    if (window.every((d) => d > 0) || window.every((d) => d < 0)) {
      push('nelson-2', range9(i), '9 consecutive points on the same side of the center line');
    }
  }

  // --- Rule 3: 6 or more consecutive points steadily increasing or decreasing ---
  for (let i = 5; i < values.length; i++) {
    const w = values.slice(i - 5, i + 1);
    if (isMonotone(w, 'increasing') || isMonotone(w, 'decreasing')) {
      push('nelson-3', range6(i), '6 consecutive points steadily increasing or decreasing');
    }
  }

  // --- Rule 4: 14 or more consecutive points alternating up and down ---
  for (let i = 13; i < values.length; i++) {
    const w = values.slice(i - 13, i + 1);
    if (isAlternating(w)) {
      push('nelson-4', range14(i), '14 consecutive points alternating up and down');
    }
  }

  // --- Rule 5: 2 out of 3 consecutive points beyond ±2σ on the same side ---
  for (let i = 2; i < values.length; i++) {
    const w = dev.slice(i - 2, i + 1); // window [i-2, i-1, i]
    const aboveCount = w.filter((d) => d > 2).length;
    const belowCount = w.filter((d) => d < -2).length;
    if (aboveCount >= 2 || belowCount >= 2) {
      push('nelson-5', [i - 2, i - 1, i], '2 of 3 consecutive points beyond ±2σ (same side)');
    }
  }

  // --- Rule 6: 4 out of 5 consecutive points beyond ±1σ on the same side ---
  for (let i = 4; i < values.length; i++) {
    const w = dev.slice(i - 4, i + 1); // window of 5
    const aboveCount = w.filter((d) => d > 1).length;
    const belowCount = w.filter((d) => d < -1).length;
    if (aboveCount >= 4 || belowCount >= 4) {
      push('nelson-6', [i - 4, i - 3, i - 2, i - 1, i], '4 of 5 consecutive points beyond ±1σ (same side)');
    }
  }

  // --- Rule 7: 15 or more consecutive points within ±1σ ---
  for (let i = 14; i < values.length; i++) {
    const w = dev.slice(i - 14, i + 1);
    if (w.every((d) => Math.abs(d) < 1)) {
      push('nelson-7', range15(i), '15 consecutive points within ±1σ (hugging the center line)');
    }
  }

  // --- Rule 8: 8 or more consecutive points beyond ±1σ (either side, no 8 same side) ---
  // All 8 are outside ±1σ but NOT all on the same side
  for (let i = 7; i < values.length; i++) {
    const w = dev.slice(i - 7, i + 1);
    const allOutside = w.every((d) => Math.abs(d) > 1);
    const allAbove = w.every((d) => d > 1);
    const allBelow = w.every((d) => d < -1);
    if (allOutside && !allAbove && !allBelow) {
      push('nelson-8', range8(i), '8 consecutive points beyond ±1σ on both sides (bimodal)');
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function range6(end: number): number[] {
  return [end - 5, end - 4, end - 3, end - 2, end - 1, end];
}
function range8(end: number): number[] {
  return [end - 7, end - 6, end - 5, end - 4, end - 3, end - 2, end - 1, end];
}
function range9(end: number): number[] {
  return [end - 8, end - 7, end - 6, end - 5, end - 4, end - 3, end - 2, end - 1, end];
}
function range14(end: number): number[] {
  return Array.from({ length: 14 }, (_, k) => end - 13 + k);
}
function range15(end: number): number[] {
  return Array.from({ length: 15 }, (_, k) => end - 14 + k);
}

function isMonotone(w: readonly number[], dir: 'increasing' | 'decreasing'): boolean {
  for (let i = 1; i < w.length; i++) {
    if (dir === 'increasing' && w[i]! <= w[i - 1]!) return false;
    if (dir === 'decreasing' && w[i]! >= w[i - 1]!) return false;
  }
  return true;
}

function isAlternating(w: readonly number[]): boolean {
  for (let i = 1; i < w.length; i++) {
    const up = w[i]! > w[i - 1]!;
    const prevUp = i > 1 && w[i - 1]! > w[i - 2]!;
    if (i > 1 && up === prevUp) return false;
  }
  return true;
}
