import { describe, it, expect } from 'vitest';
import { analyzeProcess } from './analyze';

// Reference: Montgomery, Introduction to Statistical Quality Control, 7th ed.
// Example 6.1 piston ring data — 25 subgroups of n=5
const EX61: number[][] = [
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

const subgroupInput = {
  kind: 'subgroup' as const,
  subgroupSize: 5,
  subgroups: EX61.map((row) => row.map((v) => ({ value: v }))),
};

describe('analyzeProcess – X̄-R path (n=5)', () => {
  it('returns ok', () => {
    const r = analyzeProcess(subgroupInput);
    expect(r.ok).toBe(true);
  });

  it('chart type is xbar-r (n ≤ 10 threshold)', () => {
    const r = analyzeProcess(subgroupInput);
    if (!r.ok) return;
    expect(r.value.chart.type).toBe('xbar-r');
  });

  it('subgroupCount = 25', () => {
    const r = analyzeProcess(subgroupInput);
    if (!r.ok) return;
    expect(r.value.subgroupCount).toBe(25);
  });

  it('totalMeasurements = 125', () => {
    const r = analyzeProcess(subgroupInput);
    if (!r.ok) return;
    expect(r.value.totalMeasurements).toBe(125);
  });

  it('isInControl reflects violations array', () => {
    const r = analyzeProcess(subgroupInput);
    if (!r.ok) return;
    expect(r.value.isInControl).toBe(r.value.violations.length === 0);
  });

  it('no capability when specLimits omitted', () => {
    const r = analyzeProcess(subgroupInput);
    if (!r.ok) return;
    expect(r.value.capability).toBeUndefined();
  });

  it('capability present when specLimits provided', () => {
    const r = analyzeProcess(subgroupInput, { specLimits: { usl: 74.05, lsl: 73.95 } });
    if (!r.ok) return;
    expect(r.value.capability).toBeDefined();
    expect(r.value.capability!.cp).toBeCloseTo(1.67, 1);
  });
});

describe('analyzeProcess – X̄-S path (xbarSThreshold=3)', () => {
  it('uses xbar-s when n > threshold', () => {
    const r = analyzeProcess(subgroupInput, { xbarSThreshold: 3 });
    if (!r.ok) return;
    expect(r.value.chart.type).toBe('xbar-s');
  });
});

describe('analyzeProcess – I-MR path', () => {
  const individuals = Array.from({ length: 20 }, (_, i) => ({ value: 14 + Math.sin(i) * 0.3, label: String(i + 1) }));

  it('uses i-mr for individual data', () => {
    const r = analyzeProcess({ kind: 'individual', values: individuals });
    if (!r.ok) return;
    expect(r.value.chart.type).toBe('i-mr');
  });

  it('subgroupCount = totalMeasurements for I-MR', () => {
    const r = analyzeProcess({ kind: 'individual', values: individuals });
    if (!r.ok) return;
    expect(r.value.subgroupCount).toBe(r.value.totalMeasurements);
  });
});

describe('analyzeProcess – error propagation', () => {
  it('propagates chart error (insufficient data)', () => {
    const r = analyzeProcess({ kind: 'individual', values: [{ value: 1 }] });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe('insufficient-data');
  });

  it('propagates invalid spec limits error', () => {
    const r = analyzeProcess(subgroupInput, { specLimits: { usl: 73.9, lsl: 74.1 } });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe('invalid-spec-limits');
  });
});
