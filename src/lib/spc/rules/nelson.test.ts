import { describe, it, expect } from 'vitest';
import { detectNelsonViolations } from './nelson';
import {
  RULE1_DATA, RULE2_DATA, RULE3_DATA, RULE4_DATA,
  RULE5_DATA, RULE6_DATA, RULE7_DATA, RULE8_DATA,
} from '../__fixtures__/nelson-violations';

// All fixtures use cl=0, sigma=1 (values already in sigma units)
const CL = 0;
const SIGMA = 1;

describe('detectNelsonViolations – Rule 1 (1 point beyond ±3σ)', () => {
  it('detects violation in RULE1_DATA', () => {
    const vs = detectNelsonViolations(RULE1_DATA, CL, SIGMA);
    const r1 = vs.filter((v) => v.rule === 'nelson-1');
    expect(r1.length).toBeGreaterThanOrEqual(1);
    expect(r1[0]!.subgroupIndices).toContain(18);
  });

  it('no Rule 1 on in-control data', () => {
    const data = Array(20).fill(0).map((_, i) => Math.sin(i) * 1.5);
    const vs = detectNelsonViolations(data, CL, SIGMA);
    expect(vs.filter((v) => v.rule === 'nelson-1')).toHaveLength(0);
  });
});

describe('detectNelsonViolations – Rule 2 (9 same side)', () => {
  it('detects violation in RULE2_DATA', () => {
    const vs = detectNelsonViolations(RULE2_DATA, CL, SIGMA);
    const r2 = vs.filter((v) => v.rule === 'nelson-2');
    expect(r2.length).toBeGreaterThanOrEqual(1);
  });

  it('no Rule 2 on alternating data', () => {
    const data = [0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5];
    expect(detectNelsonViolations(data, CL, SIGMA).filter((v) => v.rule === 'nelson-2')).toHaveLength(0);
  });
});

describe('detectNelsonViolations – Rule 3 (6 monotone)', () => {
  it('detects violation in RULE3_DATA', () => {
    const vs = detectNelsonViolations(RULE3_DATA, CL, SIGMA);
    expect(vs.filter((v) => v.rule === 'nelson-3').length).toBeGreaterThanOrEqual(1);
  });

  it('no Rule 3 on stable data', () => {
    const data = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
    expect(detectNelsonViolations(data, CL, SIGMA).filter((v) => v.rule === 'nelson-3')).toHaveLength(0);
  });
});

describe('detectNelsonViolations – Rule 4 (14 alternating)', () => {
  it('detects violation in RULE4_DATA', () => {
    const vs = detectNelsonViolations(RULE4_DATA, CL, SIGMA);
    expect(vs.filter((v) => v.rule === 'nelson-4').length).toBeGreaterThanOrEqual(1);
  });

  it('no Rule 4 on monotone data', () => {
    const data = Array.from({ length: 20 }, (_, i) => i * 0.1);
    expect(detectNelsonViolations(data, CL, SIGMA).filter((v) => v.rule === 'nelson-4')).toHaveLength(0);
  });
});

describe('detectNelsonViolations – Rule 5 (2/3 beyond ±2σ same side)', () => {
  it('detects violation in RULE5_DATA', () => {
    const vs = detectNelsonViolations(RULE5_DATA, CL, SIGMA);
    expect(vs.filter((v) => v.rule === 'nelson-5').length).toBeGreaterThanOrEqual(1);
  });

  it('2 below −2σ triggers rule', () => {
    const data = [0.1, -2.5, -0.2, -2.3, 0.1];
    const vs = detectNelsonViolations(data, CL, SIGMA);
    expect(vs.filter((v) => v.rule === 'nelson-5').length).toBeGreaterThanOrEqual(1);
  });
});

describe('detectNelsonViolations – Rule 6 (4/5 beyond ±1σ same side)', () => {
  it('detects violation in RULE6_DATA', () => {
    const vs = detectNelsonViolations(RULE6_DATA, CL, SIGMA);
    expect(vs.filter((v) => v.rule === 'nelson-6').length).toBeGreaterThanOrEqual(1);
  });
});

describe('detectNelsonViolations – Rule 7 (15 within ±1σ)', () => {
  it('detects violation in RULE7_DATA', () => {
    const vs = detectNelsonViolations(RULE7_DATA, CL, SIGMA);
    expect(vs.filter((v) => v.rule === 'nelson-7').length).toBeGreaterThanOrEqual(1);
  });

  it('no Rule 7 when points stray beyond ±1σ', () => {
    const data = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 1.5, 0.2, 0.3, 0.4, 0.1, 0.2, 0.3, 0.4];
    expect(detectNelsonViolations(data, CL, SIGMA).filter((v) => v.rule === 'nelson-7')).toHaveLength(0);
  });
});

describe('detectNelsonViolations – Rule 8 (8 beyond ±1σ both sides)', () => {
  it('detects violation in RULE8_DATA', () => {
    const vs = detectNelsonViolations(RULE8_DATA, CL, SIGMA);
    expect(vs.filter((v) => v.rule === 'nelson-8').length).toBeGreaterThanOrEqual(1);
  });

  it('no Rule 8 when all 8 on same side (would be Rule 6 territory)', () => {
    // 8 points all above +1σ — not bimodal, so Rule 8 should not fire
    const data = [0, 0, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5];
    const vs = detectNelsonViolations(data, CL, SIGMA);
    expect(vs.filter((v) => v.rule === 'nelson-8')).toHaveLength(0);
  });
});

describe('detectNelsonViolations – empty / trivial', () => {
  it('returns empty array for empty input', () => {
    expect(detectNelsonViolations([], CL, SIGMA)).toHaveLength(0);
  });

  it('returns empty array for perfectly centered data', () => {
    const data = Array(30).fill(0);
    // All zeros on CL, within all zones — only Rule 7 might fire (all within ±1σ)
    const vs = detectNelsonViolations(data, CL, SIGMA);
    // Rule 1-6, 8 should not fire
    const noRule7 = vs.filter((v) => v.rule !== 'nelson-7');
    expect(noRule7).toHaveLength(0);
  });
});
