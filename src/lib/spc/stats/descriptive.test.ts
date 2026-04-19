import { describe, it, expect } from 'vitest';
import {
  mean,
  range,
  stdDev,
  stdDevPopulation,
  movingRanges,
  buildSubgroups,
  grandMean,
  averageRange,
  averageStdDev,
  allValues,
} from './descriptive';

// Reference: Montgomery, Introduction to Statistical Quality Control, 7th ed.
// Example 6.1 (p.239) — piston ring diameter data, first 5 subgroups, n=5

const EX61_SUBGROUP_1 = [74.030, 74.002, 74.019, 73.992, 74.008];
const EX61_SUBGROUP_2 = [73.995, 73.992, 74.001, 74.011, 74.004];

describe('mean', () => {
  it('computes correct mean for subgroup 1 (Montgomery Ex. 6.1)', () => {
    expect(mean(EX61_SUBGROUP_1)).toBeCloseTo(74.010, 3);
  });
  it('returns 0 for empty array', () => {
    expect(mean([])).toBe(0);
  });
  it('returns value for singleton', () => {
    expect(mean([5])).toBe(5);
  });
});

describe('range', () => {
  it('computes correct range for subgroup 1 (Montgomery Ex. 6.1)', () => {
    // 74.030 − 73.992 = 0.038
    expect(range(EX61_SUBGROUP_1)).toBeCloseTo(0.038, 4);
  });
  it('returns 0 for empty array', () => {
    expect(range([])).toBe(0);
  });
  it('returns 0 for singleton', () => {
    expect(range([7])).toBe(0);
  });
});

describe('stdDev (sample)', () => {
  it('computes sample stddev for [2,4,4,4,5,5,7,9]', () => {
    // population σ = 2.0; sample s = sqrt(32/7) ≈ 2.138
    expect(stdDev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3);
  });
  it('returns 0 for singleton', () => {
    expect(stdDev([3])).toBe(0);
  });
  it('returns 0 for empty array', () => {
    expect(stdDev([])).toBe(0);
  });
});

describe('stdDevPopulation', () => {
  it('returns 0 for empty array', () => {
    expect(stdDevPopulation([])).toBe(0);
  });
  it('is less than sample stdDev for same data', () => {
    const data = [1, 2, 3, 4, 5];
    expect(stdDevPopulation(data)).toBeLessThan(stdDev(data));
  });
});

describe('movingRanges', () => {
  it('returns empty for fewer than 2 values', () => {
    expect(movingRanges([])).toHaveLength(0);
    expect(movingRanges([1])).toHaveLength(0);
  });
  it('computes |X_i − X_{i-1}|', () => {
    expect(movingRanges([10, 12, 9])).toEqual([2, 3]);
  });
  it('result length is n−1', () => {
    const data = [1, 2, 3, 4, 5];
    expect(movingRanges(data)).toHaveLength(4);
  });
});

describe('buildSubgroups', () => {
  it('sets correct index, mean, range, stdDev', () => {
    const groups = [
      EX61_SUBGROUP_1.map((v) => ({ value: v })),
      EX61_SUBGROUP_2.map((v) => ({ value: v })),
    ];
    const sgs = buildSubgroups(groups);
    expect(sgs).toHaveLength(2);
    expect(sgs[0]!.index).toBe(0);
    expect(sgs[0]!.mean).toBeCloseTo(mean(EX61_SUBGROUP_1), 5);
    expect(sgs[0]!.range).toBeCloseTo(range(EX61_SUBGROUP_1), 5);
    expect(sgs[0]!.stdDev).toBeCloseTo(stdDev(EX61_SUBGROUP_1), 5);
    expect(sgs[1]!.index).toBe(1);
  });
});

describe('grandMean / averageRange / averageStdDev', () => {
  const groups = [
    EX61_SUBGROUP_1.map((v) => ({ value: v })),
    EX61_SUBGROUP_2.map((v) => ({ value: v })),
  ];
  const sgs = buildSubgroups(groups);

  it('grandMean averages subgroup means', () => {
    const expected = mean([mean(EX61_SUBGROUP_1), mean(EX61_SUBGROUP_2)]);
    expect(grandMean(sgs)).toBeCloseTo(expected, 5);
  });

  it('averageRange averages subgroup ranges', () => {
    const expected = mean([range(EX61_SUBGROUP_1), range(EX61_SUBGROUP_2)]);
    expect(averageRange(sgs)).toBeCloseTo(expected, 5);
  });

  it('averageStdDev averages subgroup stdDevs', () => {
    const expected = mean([stdDev(EX61_SUBGROUP_1), stdDev(EX61_SUBGROUP_2)]);
    expect(averageStdDev(sgs)).toBeCloseTo(expected, 5);
  });
});

describe('allValues', () => {
  it('flattens all measurement values from subgroups', () => {
    const groups = [
      [{ value: 1 }, { value: 2 }],
      [{ value: 3 }, { value: 4 }],
    ];
    const sgs = buildSubgroups(groups);
    expect(allValues(sgs)).toEqual([1, 2, 3, 4]);
  });
});
