/**
 * Shewhart control chart constants for variables charts (n = 2 … 25).
 *
 * Source: Montgomery, D.C. Introduction to Statistical Quality Control,
 * 7th ed., Appendix VI. Wiley, 2012.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Valid subgroup sizes supported by this constants table.
 * Shewhart's original tables cover n = 2 to n = 25.
 */
export type SubgroupSize =
  | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25;

/**
 * One row of the Shewhart constants table for a given subgroup size n.
 *
 * X̄-R chart limits:
 *   UCL_X̄ = X̄̄ + A2·R̄     LCL_X̄ = X̄̄ − A2·R̄
 *   UCL_R  = D4·R̄           LCL_R  = D3·R̄
 *
 * X̄-S chart limits:
 *   UCL_X̄ = X̄̄ + A3·s̄     LCL_X̄ = X̄̄ − A3·s̄
 *   UCL_S  = B4·s̄           LCL_S  = B3·s̄
 *
 * I-MR chart limits (n = 1, uses n = 2 row for MR):
 *   UCL_I  = X̄ + E2·MR̄     LCL_I  = X̄ − E2·MR̄
 *   UCL_MR = D4·MR̄          LCL_MR = D3·MR̄
 *
 * Auxiliary:
 *   σ̂ = R̄ / d2   (short-term σ estimate from ranges)
 *   σ̂ = s̄ / c4   (short-term σ estimate from std devs)
 */
export interface ShewhartConstants {
  /** Subgroup size. */
  readonly n: SubgroupSize;
  /** X̄-R chart: X̄ limit factor (UCL/LCL = X̄̄ ± A2·R̄). */
  readonly A2: number;
  /** X̄-S chart: X̄ limit factor (UCL/LCL = X̄̄ ± A3·s̄). */
  readonly A3: number;
  /** R chart: LCL factor (LCL_R = D3·R̄; = 0 for n ≤ 6). */
  readonly D3: number;
  /** R chart: UCL factor (UCL_R = D4·R̄). */
  readonly D4: number;
  /** S chart: LCL factor (LCL_S = B3·s̄; = 0 for n ≤ 5). */
  readonly B3: number;
  /** S chart: UCL factor (UCL_S = B4·s̄). */
  readonly B4: number;
  /** Unbiasing constant for s: σ̂ = s̄ / c4. */
  readonly c4: number;
  /** Expected value of the relative range W = R/σ: E[W] = d2. */
  readonly d2: number;
  /** Standard deviation of the relative range W: σ_W = d3. */
  readonly d3: number;
  /** I-MR chart: Individuals limit factor (UCL/LCL_I = X̄ ± E2·MR̄). */
  readonly E2: number;
}

// ---------------------------------------------------------------------------
// Constants table
// ---------------------------------------------------------------------------

/**
 * Shewhart constants indexed by subgroup size n (2 ≤ n ≤ 25).
 *
 * Usage:
 *   const k = SHEWHART_CONSTANTS[5];  // n = 5
 *   const uclXbar = grandMean + k.A2 * averageRange;
 */
export const SHEWHART_CONSTANTS: Readonly<Record<SubgroupSize, ShewhartConstants>> = {
  2:  { n: 2,  A2: 1.880, A3: 2.659, D3: 0.000, D4: 3.267, B3: 0.000, B4: 3.267, c4: 0.7979, d2: 1.128, d3: 0.853, E2: 2.660 },
  3:  { n: 3,  A2: 1.023, A3: 1.954, D3: 0.000, D4: 2.574, B3: 0.000, B4: 2.568, c4: 0.8862, d2: 1.693, d3: 0.888, E2: 1.772 },
  4:  { n: 4,  A2: 0.729, A3: 1.628, D3: 0.000, D4: 2.282, B3: 0.000, B4: 2.266, c4: 0.9213, d2: 2.059, d3: 0.880, E2: 1.457 },
  5:  { n: 5,  A2: 0.577, A3: 1.427, D3: 0.000, D4: 2.115, B3: 0.000, B4: 2.089, c4: 0.9400, d2: 2.326, d3: 0.864, E2: 1.290 },
  6:  { n: 6,  A2: 0.483, A3: 1.287, D3: 0.000, D4: 2.004, B3: 0.030, B4: 1.970, c4: 0.9515, d2: 2.534, d3: 0.848, E2: 1.184 },
  7:  { n: 7,  A2: 0.419, A3: 1.182, D3: 0.076, D4: 1.924, B3: 0.118, B4: 1.882, c4: 0.9594, d2: 2.704, d3: 0.833, E2: 1.109 },
  8:  { n: 8,  A2: 0.373, A3: 1.099, D3: 0.136, D4: 1.864, B3: 0.185, B4: 1.815, c4: 0.9650, d2: 2.847, d3: 0.820, E2: 1.054 },
  9:  { n: 9,  A2: 0.337, A3: 1.032, D3: 0.184, D4: 1.816, B3: 0.239, B4: 1.761, c4: 0.9693, d2: 2.970, d3: 0.808, E2: 1.010 },
  10: { n: 10, A2: 0.308, A3: 0.975, D3: 0.223, D4: 1.777, B3: 0.284, B4: 1.716, c4: 0.9727, d2: 3.078, d3: 0.797, E2: 0.975 },
  11: { n: 11, A2: 0.285, A3: 0.927, D3: 0.256, D4: 1.744, B3: 0.321, B4: 1.679, c4: 0.9754, d2: 3.173, d3: 0.787, E2: 0.945 },
  12: { n: 12, A2: 0.266, A3: 0.886, D3: 0.283, D4: 1.717, B3: 0.354, B4: 1.646, c4: 0.9776, d2: 3.258, d3: 0.778, E2: 0.921 },
  13: { n: 13, A2: 0.249, A3: 0.850, D3: 0.307, D4: 1.693, B3: 0.382, B4: 1.618, c4: 0.9794, d2: 3.336, d3: 0.770, E2: 0.899 },
  14: { n: 14, A2: 0.235, A3: 0.817, D3: 0.328, D4: 1.672, B3: 0.406, B4: 1.594, c4: 0.9810, d2: 3.407, d3: 0.763, E2: 0.881 },
  15: { n: 15, A2: 0.223, A3: 0.789, D3: 0.347, D4: 1.653, B3: 0.428, B4: 1.572, c4: 0.9823, d2: 3.472, d3: 0.756, E2: 0.864 },
  16: { n: 16, A2: 0.212, A3: 0.763, D3: 0.363, D4: 1.637, B3: 0.448, B4: 1.552, c4: 0.9835, d2: 3.532, d3: 0.750, E2: 0.849 },
  17: { n: 17, A2: 0.203, A3: 0.739, D3: 0.378, D4: 1.622, B3: 0.466, B4: 1.534, c4: 0.9845, d2: 3.588, d3: 0.744, E2: 0.836 },
  18: { n: 18, A2: 0.194, A3: 0.718, D3: 0.391, D4: 1.608, B3: 0.482, B4: 1.518, c4: 0.9854, d2: 3.640, d3: 0.739, E2: 0.824 },
  19: { n: 19, A2: 0.187, A3: 0.698, D3: 0.403, D4: 1.597, B3: 0.497, B4: 1.503, c4: 0.9862, d2: 3.689, d3: 0.734, E2: 0.813 },
  20: { n: 20, A2: 0.180, A3: 0.680, D3: 0.415, D4: 1.585, B3: 0.510, B4: 1.490, c4: 0.9869, d2: 3.735, d3: 0.729, E2: 0.803 },
  21: { n: 21, A2: 0.173, A3: 0.663, D3: 0.425, D4: 1.575, B3: 0.523, B4: 1.477, c4: 0.9876, d2: 3.778, d3: 0.724, E2: 0.794 },
  22: { n: 22, A2: 0.167, A3: 0.647, D3: 0.434, D4: 1.566, B3: 0.534, B4: 1.466, c4: 0.9882, d2: 3.819, d3: 0.720, E2: 0.785 },
  23: { n: 23, A2: 0.162, A3: 0.633, D3: 0.443, D4: 1.557, B3: 0.545, B4: 1.455, c4: 0.9887, d2: 3.858, d3: 0.716, E2: 0.778 },
  24: { n: 24, A2: 0.157, A3: 0.619, D3: 0.451, D4: 1.548, B3: 0.555, B4: 1.445, c4: 0.9892, d2: 3.895, d3: 0.712, E2: 0.770 },
  25: { n: 25, A2: 0.153, A3: 0.606, D3: 0.459, D4: 1.541, B3: 0.565, B4: 1.435, c4: 0.9896, d2: 3.931, d3: 0.708, E2: 0.763 },
} as const;
