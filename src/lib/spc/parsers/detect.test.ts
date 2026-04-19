import { describe, it, expect } from 'vitest';
import { detectLayout } from './detect';
import type { ParsedTable } from './csv-parser';

function makeTable(headers: string[], data: string[][]): ParsedTable {
  const rows = data.map((cells) => {
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ''; });
    return row;
  });
  return { headers, rows };
}

describe('detectLayout – individual', () => {
  it('detects a single numeric column as individual', () => {
    const table = makeTable(['value'], [['10.1'], ['10.5'], ['9.8']]);
    const result = detectLayout(table);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe('individual');
    if (result.value.kind !== 'individual') return;
    expect(result.value.values).toHaveLength(3);
    expect(result.value.values[0]!.value).toBeCloseTo(10.1);
  });

  it('ignores index column, single value column → individual', () => {
    const table = makeTable(['index', 'measurement'], [['1', '5.0'], ['2', '6.1']]);
    const result = detectLayout(table);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe('individual');
  });
});

describe('detectLayout – subgroup', () => {
  it('detects multiple numeric columns as subgroup', () => {
    const table = makeTable(
      ['x1', 'x2', 'x3'],
      [['1.0', '2.0', '3.0'], ['4.0', '5.0', '6.0']],
    );
    const result = detectLayout(table);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.kind).toBe('subgroup');
    if (result.value.kind !== 'subgroup') return;
    expect(result.value.subgroupSize).toBe(3);
    expect(result.value.subgroups).toHaveLength(2);
    expect(result.value.subgroups[0]![0]!.value).toBeCloseTo(1.0);
  });

  it('strips subgroup index column', () => {
    const table = makeTable(
      ['subgroup', 'x1', 'x2', 'x3'],
      [['1', '10', '11', '12'], ['2', '13', '14', '15']],
    );
    const result = detectLayout(table);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    if (result.value.kind !== 'subgroup') return;
    expect(result.value.subgroupSize).toBe(3);
  });
});

describe('detectLayout – errors', () => {
  it('errors on no data rows', () => {
    const result = detectLayout({ headers: ['x'], rows: [] });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('insufficient-data');
  });

  it('errors when no numeric columns found', () => {
    const table = makeTable(['name', 'label'], [['foo', 'bar']]);
    const result = detectLayout(table);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('parse-error');
  });
});
