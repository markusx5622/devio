/**
 * Synthetic datasets designed to trigger exactly one Nelson rule each.
 * Process mean = 0, sigma = 1.  Values are already in sigma units so they
 * can be passed directly to detectNelsonViolations with cl=0, sigma=1.
 *
 * Reference: Nelson, L.S. "The Shewhart Control Chart — Tests for Special
 * Causes." Journal of Quality Technology 16(4), 1984, pp. 237–239.
 */

/** 18 in-control points followed by 1 point at +3.5σ → Rule 1 triggers at index 18. */
export const RULE1_DATA = [
  0.1, -0.2, 0.3, -0.1, 0.2, -0.3, 0.1, 0.0, -0.1, 0.2,
  0.0, -0.2, 0.3, 0.1, -0.1, 0.2, -0.3, 0.0,
  3.5, // violation: beyond +3σ
];

/** 9 consecutive points all above CL → Rule 2 triggers. */
export const RULE2_DATA = [
  0.1, -0.5, 0.3, -0.2, // mixed (below CL at indices 1 and 3)
  0.5, 0.3, 0.8, 0.2, 0.6, 0.4, 0.9, 0.1, 0.7, // 9 above CL
];

/** 6 consecutive strictly increasing points → Rule 3 triggers. */
export const RULE3_DATA = [
  0.0, -0.1, 0.1, -0.2, // noise
  0.1, 0.3, 0.5, 0.7, 0.9, 1.1, // 6 strictly increasing
  0.5,
];

/** 14 consecutive alternating points → Rule 4 triggers. */
export const RULE4_DATA = [
  0.5, -0.5, 0.6, -0.6, 0.4, -0.4, 0.7, -0.7,
  0.3, -0.3, 0.8, -0.8, 0.5, -0.5, // 14 alternating
  0.1,
];

/** 2 of 3 consecutive points beyond +2σ on the same side → Rule 5 triggers. */
export const RULE5_DATA = [
  0.1, -0.1, 0.2, -0.2, 0.0,
  2.5, 0.5, 2.2, // indices 5,7 beyond +2σ, 6 between — triggers on window [5,6,7]
  0.1,
];

/** 4 of 5 consecutive points beyond +1σ on the same side → Rule 6 triggers. */
export const RULE6_DATA = [
  0.0, -0.1, 0.1, -0.2,
  1.5, 1.2, 0.3, 1.4, 1.6, // 4 of 5 (indices 4,5,7,8) beyond +1σ
  0.0,
];

/** 15 consecutive points within ±1σ (hugging CL) → Rule 7 triggers. */
export const RULE7_DATA = [
  0.1, 0.3, -0.2, 0.4, -0.3, 0.2, 0.1, -0.4,
  0.3, 0.2, -0.1, 0.4, -0.3, 0.2, 0.1, // 15 within ±1σ
  0.0,
];

/** 8 consecutive points beyond ±1σ on either side (no 2 consecutive same side) → Rule 8 triggers. */
export const RULE8_DATA = [
  0.1, -0.1, 0.2, -0.2,
  1.5, -1.5, 1.2, -1.2, 1.8, -1.8, 1.3, -1.3, // 8 beyond ±1σ alternating sides
  0.1,
];
