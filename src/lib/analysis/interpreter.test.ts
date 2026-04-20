import { describe, it, expect } from 'vitest';
import { generateSpcReport } from './interpreter';
import type { AnalysisResult, XbarRChart, IMRChart } from '@/lib/spc/types';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeXbarRChart(grandMean = 10.0): XbarRChart {
  return {
    type: 'xbar-r',
    subgroups: [],
    xbarLimits: { ucl: 10.54, cl: 10.0, lcl: 9.46 },
    rLimits: { ucl: 1.2, cl: 0.5, lcl: 0 },
    grandMean,
    averageRange: 0.5,
  };
}

function makeIMRChart(): IMRChart {
  return {
    type: 'i-mr',
    individuals: [],
    movingRanges: [],
    iLimits: { ucl: 11.2, cl: 10.0, lcl: 8.8 },
    mrLimits: { ucl: 1.5, cl: 0.45, lcl: 0 },
    processMean: 10.0,
    averageMovingRange: 0.45,
  };
}

function makeAnalysis(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    chart: makeXbarRChart(),
    violations: [],
    isInControl: true,
    subgroupCount: 25,
    totalMeasurements: 125,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('generateSpcReport', () => {
  it('returns in-control / acceptable when no violations', () => {
    const result = generateSpcReport(makeAnalysis());
    expect(result.processStatus).toBe('in-control');
    expect(result.urgency).toBe('acceptable');
    expect(result.violations).toHaveLength(0);
  });

  it('returns out-of-control / immediate when isInControl is false', () => {
    const result = generateSpcReport(
      makeAnalysis({
        isInControl: false,
        violations: [
          { rule: 'nelson-1', subgroupIndices: [4], description: 'Point beyond 3σ' },
        ],
      }),
    );
    expect(result.processStatus).toBe('out-of-control');
    expect(result.urgency).toBe('immediate');
  });

  it('returns marginally-stable / monitor when violations exist but isInControl is true', () => {
    const result = generateSpcReport(
      makeAnalysis({
        isInControl: true,
        violations: [
          {
            rule: 'nelson-2',
            subgroupIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            description: '9 consecutive points same side',
          },
        ],
      }),
    );
    expect(result.processStatus).toBe('marginally-stable');
    expect(result.urgency).toBe('monitor');
  });

  it('maps nelson-1 violation to correct rule number and non-empty causes/actions', () => {
    const result = generateSpcReport(
      makeAnalysis({
        isInControl: false,
        violations: [{ rule: 'nelson-1', subgroupIndices: [7], description: 'Point beyond 3σ' }],
      }),
    );
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].rule).toBe(1);
    expect(result.violations[0].rootCauses.length).toBeGreaterThanOrEqual(2);
    expect(result.violations[0].actions.length).toBeGreaterThanOrEqual(2);
    expect(result.violations[0].interpretation).toBeTruthy();
  });

  it('maps all 8 nelson rules to correct numeric rule numbers', () => {
    const rules = [
      'nelson-1', 'nelson-2', 'nelson-3', 'nelson-4',
      'nelson-5', 'nelson-6', 'nelson-7', 'nelson-8',
    ] as const;

    rules.forEach((rule, idx) => {
      const result = generateSpcReport(
        makeAnalysis({
          violations: [{ rule, subgroupIndices: [0], description: 'test' }],
        }),
      );
      expect(result.violations[0].rule).toBe(idx + 1);
    });
  });

  it('returns capability assessment with indices when capability is provided', () => {
    const result = generateSpcReport(
      makeAnalysis({
        capability: { cp: 1.45, cpk: 1.38, pp: 1.40, ppk: 1.32, sigma: 3.96 },
      }),
    );
    expect(result.capability.assessment).toContain('1.450');
    expect(result.capability.assessment).toContain('1.380');
    expect(result.capability.recommendation).toBeTruthy();
  });

  it('returns "no spec limits" capability message when capability is absent', () => {
    const result = generateSpcReport(makeAnalysis({ capability: undefined }));
    expect(result.capability.assessment).toMatch(/no se proporcionaron/i);
  });

  it('urgency is immediate when nelson-1 violation is present even if isInControl is true', () => {
    const result = generateSpcReport(
      makeAnalysis({
        isInControl: true,
        violations: [{ rule: 'nelson-1', subgroupIndices: [0], description: 'test' }],
      }),
    );
    expect(result.urgency).toBe('immediate');
  });

  it('populates all five DMAIC fields with non-empty strings', () => {
    const result = generateSpcReport(makeAnalysis());
    expect(result.dmaic.define).toBeTruthy();
    expect(result.dmaic.measure).toBeTruthy();
    expect(result.dmaic.analyze).toBeTruthy();
    expect(result.dmaic.improve).toBeTruthy();
    expect(result.dmaic.control).toBeTruthy();
  });

  it('works correctly with an I-MR chart', () => {
    const result = generateSpcReport(
      makeAnalysis({ chart: makeIMRChart(), subgroupCount: 30, totalMeasurements: 30 }),
    );
    expect(result.processStatus).toBe('in-control');
    expect(result.dmaic.define).toContain('I-MR');
  });
});
