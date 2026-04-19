import Papa from 'papaparse';
import type { Result } from '@/lib/utils/result';
import { ok, err } from '@/lib/utils/result';
import type { SpcError } from '@/lib/spc/types';

export interface ParsedTable {
  /** Column header names in order. */
  readonly headers: readonly string[];
  /** Row data: each row is a record of header → string value. */
  readonly rows: readonly Record<string, string>[];
}

/**
 * Parse CSV text into a structured table.
 * Uses Papaparse with auto-delimiter detection.
 * Returns Err on parse errors or empty input.
 */
export function parseCsv(csv: string): Result<ParsedTable, SpcError> {
  if (!csv.trim()) {
    return err({ kind: 'parse-error', message: 'CSV input is empty' });
  }

  const result = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    delimiter: '',       // auto-detect
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  });

  if (result.errors.length > 0) {
    const first = result.errors[0];
    return err({
      kind: 'parse-error',
      message: first.message,
      row: first.row !== undefined ? first.row + 2 : undefined, // 1-based + header
    });
  }

  if (!result.data.length) {
    return err({
      kind: 'insufficient-data',
      message: 'CSV contains no data rows',
      minRequired: 1,
      actual: 0,
    });
  }

  const headers = result.meta.fields ?? [];
  return ok({ headers, rows: result.data });
}
