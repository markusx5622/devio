import type { Result } from '@/lib/utils/result';
import { ok, err } from '@/lib/utils/result';
import type { Measurement, SpcError } from '@/lib/spc/types';
import type { ParsedTable } from './csv-parser';

export type DataLayout =
  | { readonly kind: 'individual'; readonly values: readonly Measurement[] }
  | {
      readonly kind: 'subgroup';
      readonly subgroupSize: number;
      /** Row-major: subgroups[i] = measurements in subgroup i. */
      readonly subgroups: readonly (readonly Measurement[])[];
    };

/**
 * Detect whether a ParsedTable represents individual measurements or subgroup data,
 * then extract the numeric values.
 *
 * Detection heuristic:
 *  - If there is exactly one numeric column → individual (I-MR).
 *  - If there are 2–25 numeric columns all same-named pattern (x1, x2…) → subgroup rows.
 *  - If there is a "subgroup" index column plus numeric columns → subgroup rows.
 */
export function detectLayout(table: ParsedTable): Result<DataLayout, SpcError> {
  if (table.rows.length === 0) {
    return err({ kind: 'insufficient-data', message: 'No data rows', minRequired: 1, actual: 0 });
  }

  // Identify numeric columns (every row parseable as finite number)
  const numericHeaders = table.headers.filter((h) =>
    table.rows.every((row) => {
      const v = parseFloat(row[h] ?? '');
      return isFinite(v);
    }),
  );

  // Strip known index / label columns
  const valueHeaders = numericHeaders.filter(
    (h) => !/^(subgroup|sample|group|index|time|date|id|label)$/i.test(h),
  );

  if (valueHeaders.length === 0) {
    return err({
      kind: 'parse-error',
      message: 'No numeric value columns found in data',
    });
  }

  if (valueHeaders.length === 1) {
    // Individual measurements
    const col = valueHeaders[0];
    const values: Measurement[] = table.rows.map((row, i) => ({
      value: parseFloat(row[col]!),
      label: String(i + 1),
    }));
    return ok({ kind: 'individual', values });
  }

  // Multiple numeric columns → subgroup layout
  const n = valueHeaders.length;
  if (n > 25) {
    return err({
      kind: 'invalid-subgroup-size',
      message: `Subgroup size ${n} exceeds maximum of 25`,
      subgroupSize: n,
      minSize: 2,
      maxSize: 25,
    });
  }

  const subgroups: Measurement[][] = table.rows.map((row) =>
    valueHeaders.map((h) => ({ value: parseFloat(row[h]!) })),
  );

  return ok({ kind: 'subgroup', subgroupSize: n, subgroups });
}
