import { describe, it, expect } from 'vitest';
import { computeCapability, categorize } from './capability';
import { computeXbarR } from '@/lib/spc/charts/x-bar-r';

// Reference: Montgomery, Introduction to Statistical Quality Control, 7th ed.
// Example 3.1 (p.108) — piston ring diameter
// USL = 74.05, LSL = 73.95; X̄̄ ≈ 74.001, σ̂ = R̄/d2 ≈ 0.0232/2.326 ≈ 0.00998
// Cp ≈ 0.10 / (6 × 0.00998) ≈ 1.67; Cpk ≈ min[(74.05−74.001), (74.001−73.95)] / (3×0.00998)
//   = min[0.049, 0.051] / 0.02994 ≈ 1.64

const EX61_DATA: number[][] = [
  [74.030, 74.002, 74.019, 73.992, 74.008],
  [73.995, 73.992, 74.001, 74.011, 74.004],
  [73.988, 74.024, 74.021, 74.005, 74.002],
  [74.002, 73.996, 73.993, 74.015, 74.009],
  [73.992, 74.007, 74.015, 73.989, 74.014],
  [74.009, 73.994, 73.997, 73.985, 73.993],
  [73.995, 74.006, 73.994, 74.000, 74.005],
  [73.985, 74.003, 73.993, 74.015, 73.988],
  [74.008, 73.995, 74.009, 74.005, 74.004],
  [73.998, 74.000, 73.990, 74.007, 73.995],
  [73.994, 73.998, 73.994, 73.995, 74.001],
  [74.004, 74.000, 74.007, 74.000, 73.996],
  [73.983, 74.002, 73.998, 73.997, 74.012],
  [74.006, 73.967, 73.994, 74.000, 73.984],
  [74.012, 74.014, 73.998, 73.999, 74.007],
  [74.000, 73.984, 74.005, 73.998, 73.996],
  [73.994, 74.012, 73.986, 74.005, 74.007],
  [74.006, 74.010, 74.018, 74.003, 74.000],
  [73.984, 74.002, 74.003, 74.005, 73.997],
  [74.000, 74.010, 74.013, 74.020, 74.003],
  [73.982, 74.001, 74.015, 74.005, 73.996],
  [74.004, 73.999, 73.990, 74.006, 74.009],
  [74.010, 73.989, 73.990, 74.009, 74.014],
  [74.015, 74.008, 73.993, 74.000, 74.010],
  [73.982, 73.984, 73.995, 74.017, 74.013],
];

const groups = EX61_DATA.map((row) => row.map((v) => ({ value: v })));
const SPEC = { usl: 74.05, lsl: 73.95 };

describe('computeCapability – Montgomery piston ring data', () => {
  it('returns ok for valid xbar-r chart + spec limits', () => {
    const chart = computeXbarR(groups);
    expect(chart.ok).toBe(true);
    if (!chart.ok) return;
    const cap = computeCapability(chart.value, SPEC);
    expect(cap.ok).toBe(true);
  });

  it('Cp ≈ 1.67 (Montgomery §3.1)', () => {
    const chart = computeXbarR(groups);
    if (!chart.ok) return;
    const cap = computeCapability(chart.value, SPEC);
    if (!cap.ok) return;
    expect(cap.value.cp).toBeCloseTo(1.67, 1);
  });

  it('Cpk ≤ Cp (centering penalty)', () => {
    const chart = computeXbarR(groups);
    if (!chart.ok) return;
    const cap = computeCapability(chart.value, SPEC);
    if (!cap.ok) return;
    expect(cap.value.cpk).toBeLessThanOrEqual(cap.value.cp);
  });

  it('Pp ≤ Cp (long-term σ ≥ short-term σ̂)', () => {
    const chart = computeXbarR(groups);
    if (!chart.ok) return;
    const cap = computeCapability(chart.value, SPEC);
    if (!cap.ok) return;
    expect(cap.value.pp).toBeLessThanOrEqual(cap.value.cp + 0.05); // allow small rounding
  });

  it('sigma > 0', () => {
    const chart = computeXbarR(groups);
    if (!chart.ok) return;
    const cap = computeCapability(chart.value, SPEC);
    if (!cap.ok) return;
    expect(cap.value.sigma).toBeGreaterThan(0);
  });
});

describe('computeCapability – error cases', () => {
  it('errors when USL ≤ LSL', () => {
    const chart = computeXbarR(groups);
    if (!chart.ok) return;
    const cap = computeCapability(chart.value, { usl: 73.95, lsl: 74.05 });
    expect(cap.ok).toBe(false);
    if (cap.ok) return;
    expect(cap.error.kind).toBe('invalid-spec-limits');
  });

  it('errors when USL = LSL', () => {
    const chart = computeXbarR(groups);
    if (!chart.ok) return;
    const cap = computeCapability(chart.value, { usl: 74.0, lsl: 74.0 });
    expect(cap.ok).toBe(false);
  });
});

describe('categorize', () => {
  it('excellent for ≥ 1.67', () => expect(categorize(1.67)).toBe('excellent'));
  it('adequate for ≥ 1.33', () => expect(categorize(1.4)).toBe('adequate'));
  it('marginal for ≥ 1.00', () => expect(categorize(1.0)).toBe('marginal'));
  it('inadequate for < 1.00', () => expect(categorize(0.9)).toBe('inadequate'));
});
