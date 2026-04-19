// ============================================================================
// src/lib/spc/constants.ts — Shewhart Control Chart Constants
//
// Tabulated factors for computing control limits.
// Source: Montgomery, D.C. "Introduction to Statistical Quality Control",
//         8th ed., Wiley, 2020, Appendix Table VI (pp. 725–726).
//
// All values rounded to the same precision as Montgomery's table.
// ============================================================================

/**
 * Shewhart constants for a given subgroup size n.
 *
 * Usage:
 *   X̄-R chart:  UCL_x̄ = x̄̄ + A2·R̄    UCL_R = D4·R̄    LCL_R = D3·R̄
 *   X̄-S chart:  UCL_x̄ = x̄̄ + A3·S̄    UCL_S = B4·S̄    LCL_S = B3·S̄
 *   I-MR chart: Uses n=2 constants → E2 = 3/d2, MR limits via D3/D4 at n=2
 *   σ̂_within:   R̄/d2 (range-based) or S̄/c4 (std-dev-based)
 */
export interface ShewhartConstants {
  /** Subgroup size. */
  readonly n: number;
  /** Factor for X̄ chart limits using R̄. UCL/LCL = x̄̄ ± A2·R̄. */
  readonly A2: number;
  /** Factor for X̄ chart limits using S̄. UCL/LCL = x̄̄ ± A3·S̄. */
  readonly A3: number;
  /** Unbiasing constant for σ̂ from S̄. σ̂ = S̄/c4. */
  readonly c4: number;
  /** Expected value of R/σ. σ̂ = R̄/d2. */
  readonly d2: number;
  /** Std deviation of R/σ. Used to compute σ_R = d3·σ. */
  readonly d3: number;
  /** Lower control limit factor for R chart. LCL_R = D3·R̄. */
  readonly D3: number;
  /** Upper control limit factor for R chart. UCL_R = D4·R̄. */
  readonly D4: number;
  /** Lower control limit factor for S chart. LCL_S = B3·S̄. */
  readonly B3: number;
  /** Upper control limit factor for S chart. UCL_S = B4·S̄. */
  readonly B4: number;
}

/**
 * Valid subgroup sizes for which constants are tabulated.
 * n=2 through n=25. Extendable by adding entries to the table.
 */
export type SubgroupSize =
  | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25;

/**
 * Lookup table indexed by subgroup size.
 * Only valid SubgroupSize keys are accepted — arbitrary numbers are rejected
 * at compile time.
 */
type ShewhartTable = Readonly<Record<SubgroupSize, ShewhartConstants>>;

/**
 * Shewhart control chart constants, n = 2 to 25.
 *
 * Ref: Montgomery, "Introduction to Statistical Quality Control",
 *      8th ed., Appendix Table VI (pp. 725–726).
 *
 * Cross-verified against Grant & Leavenworth, "Statistical Quality Control",
 * 7th ed., Appendix Table B.
 */
export const SHEWHART_CONSTANTS: ShewhartTable = {
  //          A2      A3      c4       d2      d3      D3     D4      B3     B4
  2:  { n: 2,  A2: 1.880, A3: 2.659, c4: 0.7979, d2: 1.128, d3: 0.853, D3: 0,     D4: 3.267, B3: 0,     B4: 3.267 },
  3:  { n: 3,  A2: 1.023, A3: 1.954, c4: 0.8862, d2: 1.693, d3: 0.888, D3: 0,     D4: 2.574, B3: 0,     B4: 2.568 },
  4:  { n: 4,  A2: 0.729, A3: 1.628, c4: 0.9213, d2: 2.059, d3: 0.880, D3: 0,     D4: 2.282, B3: 0,     B4: 2.266 },
  5:  { n: 5,  A2: 0.577, A3: 1.427, c4: 0.9400, d2: 2.326, d3: 0.864, D3: 0,     D4: 2.114, B3: 0,     B4: 2.089 },
  6:  { n: 6,  A2: 0.483, A3: 1.287, c4: 0.9515, d2: 2.534, d3: 0.848, D3: 0,     D4: 2.004, B3: 0.030, B4: 1.970 },
  7:  { n: 7,  A2: 0.419, A3: 1.182, c4: 0.9594, d2: 2.704, d3: 0.833, D3: 0.076, D4: 1.924, B3: 0.118, B4: 1.882 },
  8:  { n: 8,  A2: 0.373, A3: 1.099, c4: 0.9650, d2: 2.847, d3: 0.820, D3: 0.136, D4: 1.864, B3: 0.185, B4: 1.815 },
  9:  { n: 9,  A2: 0.337, A3: 1.032, c4: 0.9693, d2: 2.970, d3: 0.808, D3: 0.184, D4: 1.816, B3: 0.239, B4: 1.761 },
  10: { n: 10, A2: 0.308, A3: 0.975, c4: 0.9727, d2: 3.078, d3: 0.797, D3: 0.223, D4: 1.777, B3: 0.284, B4: 1.716 },
  11: { n: 11, A2: 0.285, A3: 0.927, c4: 0.9754, d2: 3.173, d3: 0.787, D3: 0.256, D4: 1.744, B3: 0.321, B4: 1.679 },
  12: { n: 12, A2: 0.266, A3: 0.886, c4: 0.9776, d2: 3.258, d3: 0.778, D3: 0.283, D4: 1.717, B3: 0.354, B4: 1.646 },
  13: { n: 13, A2: 0.249, A3: 0.850, c4: 0.9794, d2: 3.336, d3: 0.770, D3: 0.307, D4: 1.693, B3: 0.382, B4: 1.618 },
  14: { n: 14, A2: 0.235, A3: 0.817, c4: 0.9810, d2: 3.407, d3: 0.763, D3: 0.328, D4: 1.672, B3: 0.406, B4: 1.594 },
  15: { n: 15, A2: 0.223, A3: 0.789, c4: 0.9823, d2: 3.472, d3: 0.756, D3: 0.347, D4: 1.653, B3: 0.428, B4: 1.572 },
  16: { n: 16, A2: 0.212, A3: 0.763, c4: 0.9835, d2: 3.532, d3: 0.750, D3: 0.363, D4: 1.637, B3: 0.448, B4: 1.552 },
  17: { n: 17, A2: 0.203, A3: 0.739, c4: 0.9845, d2: 3.588, d3: 0.744, D3: 0.378, D4: 1.622, B3: 0.466, B4: 1.534 },
  18: { n: 18, A2: 0.194, A3: 0.718, c4: 0.9854, d2: 3.640, d3: 0.739, D3: 0.391, D4: 1.608, B3: 0.482, B4: 1.518 },
  19: { n: 19, A2: 0.187, A3: 0.698, c4: 0.9862, d2: 3.689, d3: 0.734, D3: 0.403, D4: 1.597, B3: 0.497, B4: 1.503 },
  20: { n: 20, A2: 0.180, A3: 0.680, c4: 0.9869, d2: 3.735, d3: 0.729, D3: 0.415, D4: 1.585, B3: 0.510, B4: 1.490 },
  21: { n: 21, A2: 0.173, A3: 0.663, c4: 0.9876, d2: 3.778, d3: 0.724, D3: 0.425, D4: 1.575, B3: 0.523, B4: 1.477 },
  22: { n: 22, A2: 0.167, A3: 0.647, c4: 0.9882, d2: 3.819, d3: 0.720, D3: 0.434, D4: 1.566, B3: 0.534, B4: 1.466 },
  23: { n: 23, A2: 0.162, A3: 0.633, c4: 0.9887, d2: 3.858, d3: 0.716, D3: 0.443, D4: 1.557, B3: 0.545, B4: 1.455 },
  24: { n: 24, A2: 0.157, A3: 0.619, c4: 0.9892, d2: 3.895, d3: 0.712, D3: 0.451, D4: 1.548, B3: 0.555, B4: 1.445 },
  25: { n: 25, A2: 0.153, A3: 0.606, c4: 0.9896, d2: 3.931, d3: 0.708, D3: 0.459, D4: 1.541, B3: 0.565, B4: 1.435 },
};

/**
 * E2 factor for the Individuals (I-MR) chart.
 * E2 = 3 / d2 where d2 is evaluated at n=2 (moving range window).
 *
 * Precomputed for clarity; equivalent to 3 / SHEWHART_CONSTANTS[2].d2.
 * UCL_I = x̄ + E2·MR̄    LCL_I = x̄ − E2·MR̄
 *
 * Ref: Montgomery §6.4.
 */
export const E2: number = 3 / SHEWHART_CONSTANTS[2].d2; // ≈ 2.6596

/**
 * Type-safe lookup. Returns the constants for a given subgroup size,
 * or undefined if the size is not tabulated.
 *
 * Pure function — no side effects, no throws.
 */
export function getShewhartConstants(n: number): ShewhartConstants | undefined {
  return (SHEWHART_CONSTANTS as Readonly<Record<number, ShewhartConstants>>)[n];
}