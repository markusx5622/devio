import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateSpcReport } from '@/lib/analysis/interpreter';
import type { AnalysisResult } from '@/lib/spc/types';

// Minimal shape validation — enough to guard against malformed requests
const AnalysisSchema = z
  .object({
    chart: z.object({ type: z.enum(['xbar-r', 'xbar-s', 'i-mr']) }),
    violations: z.array(
      z.object({
        rule: z.string(),
        subgroupIndices: z.array(z.number()),
        description: z.string(),
      }),
    ),
    isInControl: z.boolean(),
    subgroupCount: z.number(),
    totalMeasurements: z.number(),
  })
  .passthrough();

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: 'Cuerpo de solicitud inválido.' } },
      { status: 400 },
    );
  }

  const parsed = AnalysisSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { message: 'Los datos de análisis son inválidos o incompletos.' } },
      { status: 400 },
    );
  }

  const insights = generateSpcReport(parsed.data as unknown as AnalysisResult);
  return NextResponse.json({ ok: true, data: insights });
}
