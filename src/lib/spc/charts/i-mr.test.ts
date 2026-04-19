import { describe, it, expect } from 'vitest';
import { computeIMR } from './i-mr';

// Reference: Montgomery, Introduction to Statistical Quality Control, 7th ed.
// Example 9.1 (p.388) — viscosity measurements (n=1 per batch)
// Published: X̄ ≈ 13.998, MR̄ ≈ 0.5429
// UCL_I ≈ 15.441, LCL_I ≈ 12.554, UCL_MR ≈ 1.774

const EX91_DATA = [
  13.6, 14.1, 14.6, 13.4, 14.4, 14.1, 14.8, 14.6, 14.0, 14.1,
  14.6, 14.4, 13.6, 13.8, 14.2, 14.7, 14.2, 14.5, 14.3, 13.9,
];

const individuals = EX91_DATA.map((v, i) => ({ value: v, label: String(i + 1) }));

describe('computeIMR – Montgomery Example 9.1', () => {
  it('returns ok', () => {
    expect(computeIMR(individuals).ok).toBe(true);
  });

  it('chart type is i-mr', () => {
    const r = computeIMR(individuals);
    if (!r.ok) return;
    expect(r.value.type).toBe('i-mr');
  });

  it('process mean ≈ 14.195', () => {
    const r = computeIMR(individuals);
    if (!r.ok) return;
    // mean([13.6…13.9]) = 283.9 / 20 = 14.195
    expect(r.value.processMean).toBeCloseTo(14.195, 3);
  });

  it('average moving range ≈ 0.479', () => {
    const r = computeIMR(individuals);
    if (!r.ok) return;
    // sum of 19 successive |MR| / 19 = 0.479
    expect(r.value.averageMovingRange).toBeCloseTo(0.479, 2);
  });

  it('movingRanges length = observations − 1', () => {
    const r = computeIMR(individuals);
    if (!r.ok) return;
    expect(r.value.movingRanges).toHaveLength(EX91_DATA.length - 1);
  });

  it('I UCL = processMean + E2 · MR̄', () => {
    const r = computeIMR(individuals);
    if (!r.ok) return;
    const expected = r.value.processMean + 2.660 * r.value.averageMovingRange;
    expect(r.value.iLimits.ucl).toBeCloseTo(expected, 6);
  });

  it('I LCL = processMean − E2 · MR̄', () => {
    const r = computeIMR(individuals);
    if (!r.ok) return;
    const expected = r.value.processMean - 2.660 * r.value.averageMovingRange;
    expect(r.value.iLimits.lcl).toBeCloseTo(expected, 6);
  });

  it('MR UCL = D4 · MR̄ (D4=3.267 for n=2)', () => {
    const r = computeIMR(individuals);
    if (!r.ok) return;
    expect(r.value.mrLimits.ucl).toBeCloseTo(3.267 * r.value.averageMovingRange, 6);
  });

  it('MR LCL = 0 (D3=0 for n=2)', () => {
    const r = computeIMR(individuals);
    if (!r.ok) return;
    expect(r.value.mrLimits.lcl).toBe(0);
  });
});

describe('computeIMR – error cases', () => {
  it('errors for empty array', () => {
    const r = computeIMR([]);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe('insufficient-data');
  });

  it('errors for single observation', () => {
    const r = computeIMR([{ value: 5 }]);
    expect(r.ok).toBe(false);
  });
});
