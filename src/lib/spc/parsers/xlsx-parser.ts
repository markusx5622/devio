import ExcelJS from 'exceljs';
import type { Result } from '@/lib/utils/result';
import { ok, err } from '@/lib/utils/result';
import type { SpcError } from '@/lib/spc/types';
import type { ParsedTable } from './csv-parser';

/**
 * Parse an XLSX buffer into a structured table using the first worksheet.
 * The first non-empty row is treated as the header row.
 */
export async function parseXlsx(buffer: ArrayBuffer): Promise<Result<ParsedTable, SpcError>> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return err({ kind: 'parse-error', message: 'XLSX file contains no worksheets' });
    }

    const allRows: string[][] = [];
    sheet.eachRow({ includeEmpty: false }, (row) => {
      const cells = (row.values as (ExcelJS.CellValue | null)[])
        .slice(1) // ExcelJS row.values is 1-indexed; index 0 is undefined
        .map((cell) => (cell === null || cell === undefined ? '' : String(cell).trim()));
      allRows.push(cells);
    });

    if (allRows.length === 0) {
      return err({
        kind: 'insufficient-data',
        message: 'XLSX worksheet is empty',
        minRequired: 2,
        actual: 0,
      });
    }

    const headers = allRows[0].map((h) => h.trim());
    const dataRows = allRows.slice(1);

    if (dataRows.length === 0) {
      return err({
        kind: 'insufficient-data',
        message: 'XLSX worksheet has headers but no data rows',
        minRequired: 1,
        actual: 0,
      });
    }

    const rows = dataRows.map((cells) => {
      const record: Record<string, string> = {};
      headers.forEach((h, i) => {
        record[h] = cells[i] ?? '';
      });
      return record;
    });

    return ok({ headers, rows });
  } catch (cause) {
    return err({
      kind: 'parse-error',
      message: cause instanceof Error ? cause.message : 'Failed to parse XLSX file',
    });
  }
}
