import { describe, it, expect } from 'vitest';
import { computeXbarS } from './x-bar-s';

// Reference: Montgomery, Introduction to Statistical Quality Control, 7th ed.
// Example 6.3 (p.261) — same piston ring dataset, n=5
// For n=5: A3=1.427, B3=0, B4=2.089
// Published: X̄̄ ≈ 74.001, s̄ ≈ 0.0094
// UCL_X̄ ≈ 74.0144, LCL_X̄ ≈ 73.9876
// UCL_S ≈ 0.0196, LCL_S = 0

const EX63_DATA: number[][] = [
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

const groups = EX63_DATA.map((row) => row.map((v) => ({ value: v })));

describe('computeXbarS – Montgomery Example 6.3', () => {
  it('returns ok', () => {
    expect(computeXbarS(groups).ok).toBe(true);
  });

  it('chart type is xbar-s', () => {
    const r = computeXbarS(groups);
    if (!r.ok) return;
    expect(r.value.type).toBe('xbar-s');
  });

  it('grand mean ≈ 74.001', () => {
    const r = computeXbarS(groups);
    if (!r.ok) return;
    expect(r.value.grandMean).toBeCloseTo(74.001, 3);
  });

  it('average stdDev s̄ ≈ 0.0094', () => {
    const r = computeXbarS(groups);
    if (!r.ok) return;
    expect(r.value.averageStdDev).toBeCloseTo(0.0094, 3);
  });

  it('X̄ UCL ≈ 74.0144', () => {
    const r = computeXbarS(groups);
    if (!r.ok) return;
    expect(r.value.xbarLimits.ucl).toBeCloseTo(74.0144, 3);
  });

  it('X̄ LCL ≈ 73.9876', () => {
    const r = computeXbarS(groups);
    if (!r.ok) return;
    expect(r.value.xbarLimits.lcl).toBeCloseTo(73.9876, 3);
  });

  it('S UCL ≈ 0.0196 (B4 · s̄)', () => {
    const r = computeXbarS(groups);
    if (!r.ok) return;
    expect(r.value.sLimits.ucl).toBeCloseTo(0.0196, 3);
  });

  it('S LCL = 0 for n=5 (B3=0)', () => {
    const r = computeXbarS(groups);
    if (!r.ok) return;
    expect(r.value.sLimits.lcl).toBe(0);
  });
});

describe('computeXbarS – error cases', () => {
  it('errors on < 2 subgroups', () => {
    const r = computeXbarS([[{ value: 1 }, { value: 2 }]]);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe('insufficient-data');
  });

  it('errors on subgroup size 1', () => {
    const r = computeXbarS([[{ value: 1 }], [{ value: 2 }]]);
    expect(r.ok).toBe(false);
  });
});
