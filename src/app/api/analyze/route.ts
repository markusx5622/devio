import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseCsv, parseXlsx, detectLayout, analyzeProcess } from '@/lib/spc';
import type { ChartInput, AnalyzeOptions } from '@/lib/spc';
import type { SpcError } from '@/lib/spc/types';

const ParamsSchema = z.object({
  analysisType: z.enum(['xbar-r', 'xbar-s', 'imr', 'auto']).default('auto'),
  usl: z.coerce.number().optional(),
  lsl: z.coerce.number().optional(),
});

function spcErrorToMessage(error: SpcError): { code: string; message: string } {
  switch (error.kind) {
    case 'parse-error':
      return {
        code: 'PARSE_ERROR',
        message: `Error al leer el archivo${error.row ? ` en la fila ${error.row}` : ''}${error.column ? `, columna "${error.column}"` : ''}: ${error.message}`,
      };
    case 'insufficient-data':
      return {
        code: 'INSUFFICIENT_DATA',
        message: `Datos insuficientes: se necesitan al menos ${error.minRequired} subgrupos, pero se encontraron ${error.actual}.`,
      };
    case 'invalid-subgroup-size':
      return {
        code: 'INVALID_SUBGROUP_SIZE',
        message: `El tamaño de subgrupo (${error.subgroupSize}) no es válido. Debe estar entre ${error.minSize} y ${error.maxSize}.`,
      };
    case 'missing-spec-limits':
      return {
        code: 'MISSING_SPEC_LIMITS',
        message: 'Se requieren los límites de especificación (USL y LSL) para calcular los índices de capacidad.',
      };
    case 'invalid-spec-limits':
      return {
        code: 'INVALID_SPEC_LIMITS',
        message: `Los límites de especificación no son válidos: USL (${error.usl}) debe ser mayor que LSL (${error.lsl}).`,
      };
    case 'calculation-error':
      return {
        code: 'CALCULATION_ERROR',
        message: `Error en el cálculo estadístico: ${error.message}`,
      };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_REQUEST', message: 'La solicitud debe enviarse como multipart/form-data.' } },
      { status: 400 },
    );
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: { code: 'MISSING_FILE', message: 'No se encontró ningún archivo en la solicitud.' } },
      { status: 400 },
    );
  }

  const params = ParamsSchema.safeParse({
    analysisType: formData.get('analysisType') ?? 'auto',
    usl: formData.get('usl') ?? undefined,
    lsl: formData.get('lsl') ?? undefined,
  });
  if (!params.success) {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_PARAMS', message: 'Parámetros de análisis inválidos.' } },
      { status: 400 },
    );
  }
  const { analysisType, usl, lsl } = params.data;

  // ── Parse file ─────────────────────────────────────────────────────────────
  const ext = file.name.split('.').pop()?.toLowerCase();
  const tableResult =
    ext === 'xlsx' || ext === 'xls'
      ? await parseXlsx(await file.arrayBuffer())
      : parseCsv(await file.text());

  if (!tableResult.ok) {
    return NextResponse.json(
      { ok: false, error: spcErrorToMessage(tableResult.error) },
      { status: 400 },
    );
  }

  // ── Detect layout ─────────────────────────────────────────────────────────
  const layoutResult = detectLayout(tableResult.value);
  if (!layoutResult.ok) {
    return NextResponse.json(
      { ok: false, error: spcErrorToMessage(layoutResult.error) },
      { status: 400 },
    );
  }

  const layout = layoutResult.value;

  // ── Build ChartInput ──────────────────────────────────────────────────────
  let chartInput: ChartInput;
  if (analysisType === 'imr' || layout.kind === 'individual') {
    const values =
      layout.kind === 'individual'
        ? layout.values
        : layout.subgroups.flatMap((sg) => [...sg]);
    chartInput = { kind: 'individual', values };
  } else {
    chartInput = {
      kind: 'subgroup',
      subgroupSize: layout.subgroupSize,
      subgroups: layout.subgroups,
    };
  }

  // ── Build options ─────────────────────────────────────────────────────────
  const options: AnalyzeOptions = {
    xbarSThreshold:
      analysisType === 'xbar-r' ? 25
      : analysisType === 'xbar-s' ? 1
      : 10,
    specLimits:
      usl !== undefined && lsl !== undefined ? { usl, lsl } : undefined,
  };

  // ── Run analysis ──────────────────────────────────────────────────────────
  const result = analyzeProcess(chartInput, options);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: spcErrorToMessage(result.error) },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, data: result.value });
}
