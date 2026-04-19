import { describe, it, expect } from 'vitest';
import { parseCsv } from './csv-parser';
import { readFileSync } from 'fs';
import { join } from 'path';

const FIXTURE_PATH = join(__dirname, '../__fixtures__/sample-data.csv');

describe('parseCsv', () => {
  it('parses sample-data.csv fixture with correct dimensions', () => {
    const csv = readFileSync(FIXTURE_PATH, 'utf-8');
    const result = parseCsv(csv);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.headers).toEqual(['subgroup', 'x1', 'x2', 'x3', 'x4', 'x5']);
    expect(result.value.rows).toHaveLength(25);
  });

  it('returns first row values correctly', () => {
    const csv = readFileSync(FIXTURE_PATH, 'utf-8');
    const result = parseCsv(csv);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.rows[0]!['x1']).toBe('74.030');
    expect(result.value.rows[0]!['x5']).toBe('74.008');
  });

  it('returns parse-error for empty input', () => {
    const result = parseCsv('');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('parse-error');
  });

  it('parses semicolon-delimited CSV', () => {
    const csv = 'a;b;c\n1;2;3\n4;5;6';
    const result = parseCsv(csv);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.rows).toHaveLength(2);
    expect(result.value.rows[0]!['a']).toBe('1');
  });

  it('trims header whitespace', () => {
    const csv = ' value , label \n1,a\n2,b';
    const result = parseCsv(csv);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.headers).toEqual(['value', 'label']);
  });
});
