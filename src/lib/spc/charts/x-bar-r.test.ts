import { describe, it, expect } from 'vitest';
import { computeXbarR } from './x-bar-r';

// Reference: Montgomery, Introduction to Statistical Quality Control, 7th ed.
// Example 6.1 (p.239-244) — piston ring diameter (mm × 10^-3 offset from 74)
// Using 25 subgroups of n=5; published results: X̄̄ ≈ 74.001, R̄ ≈ 0.0232
// UCL_X̄ ≈ 74.0144, LCL_X̄ ≈ 73.9876, UCL_R ≈ 0.0489, LCL_R = 0

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

describe('computeXbarR – Montgomery Example 6.1', () => {
  it('returns ok', () => {
    const result = computeXbarR(groups);
    expect(result.ok).toBe(true);
  });

  it('chart type is xbar-r', () => {
    const result = computeXbarR(groups);
    if (!result.ok) return;
    expect(result.value.type).toBe('xbar-r');
  });

  it('grand mean ≈ 74.001 (Montgomery p.244)', () => {
    const result = computeXbarR(groups);
    if (!result.ok) return;
    expect(result.value.grandMean).toBeCloseTo(74.001, 3);
  });

  it('average range ≈ 0.0232 (Montgomery p.244)', () => {
    const result = computeXbarR(groups);
    if (!result.ok) return;
    expect(result.value.averageRange).toBeCloseTo(0.0232, 4);
  });

  it('X̄ UCL ≈ 74.0144 (Montgomery p.244)', () => {
    const result = computeXbarR(groups);
    if (!result.ok) return;
    expect(result.value.xbarLimits.ucl).toBeCloseTo(74.0144, 3);
  });

  it('X̄ LCL ≈ 73.9876 (Montgomery p.244)', () => {
    const result = computeXbarR(groups);
    if (!result.ok) return;
    expect(result.value.xbarLimits.lcl).toBeCloseTo(73.9876, 3);
  });

  it('R UCL ≈ 0.0489 (Montgomery p.244)', () => {
    const result = computeXbarR(groups);
    if (!result.ok) return;
    expect(result.value.rLimits.ucl).toBeCloseTo(0.0489, 3);
  });

  it('R LCL = 0 for n=5 (D3=0)', () => {
    const result = computeXbarR(groups);
    if (!result.ok) return;
    expect(result.value.rLimits.lcl).toBe(0);
  });

  it('has 25 subgroups', () => {
    const result = computeXbarR(groups);
    if (!result.ok) return;
    expect(result.value.subgroups).toHaveLength(25);
  });
});

describe('computeXbarR – error cases', () => {
  it('returns error for fewer than 2 subgroups', () => {
    const result = computeXbarR([[{ value: 1 }]]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('insufficient-data');
  });

  it('returns error for subgroup size 1', () => {
    const result = computeXbarR([[{ value: 1 }], [{ value: 2 }]]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('invalid-subgroup-size');
  });

  it('returns error for unequal subgroup sizes', () => {
    const result = computeXbarR([
      [{ value: 1 }, { value: 2 }],
      [{ value: 3 }, { value: 4 }, { value: 5 }],
    ]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('invalid-subgroup-size');
  });
});
