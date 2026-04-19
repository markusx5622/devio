import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateInsights } from '@/lib/ai/client';
import type { AnalysisResult } from '@/lib/spc/types';

// ---------------------------------------------------------------------------
// In-memory rate limiting (TODO: replace with Vercel KV for multi-instance)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10;           // requests per window per IP

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
    return { allowed: false, retryAfterMs };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

// Prune stale entries periodically to avoid memory leaks
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitStore.entries()) {
      if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
        rateLimitStore.delete(ip);
      }
    }
  },
  5 * 60_000,
);

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: { code: 'RATE_LIMITED', message: 'Demasiadas solicitudes. Espera antes de intentarlo de nuevo.' } },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
      },
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'BAD_REQUEST', message: 'Cuerpo de solicitud inválido.' } },
      { status: 400 },
    );
  }

  // Validate that we received a valid AnalysisResult shape (basic check)
  const schema = z.object({
    chart: z.object({ type: z.enum(['xbar-r', 'xbar-s', 'i-mr']) }),
    violations: z.array(z.object({ rule: z.string(), subgroupIndices: z.array(z.number()), description: z.string() })),
    isInControl: z.boolean(),
    subgroupCount: z.number(),
    totalMeasurements: z.number(),
  }).passthrough();

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: 'BAD_REQUEST', message: 'Los datos de análisis son inválidos o incompletos.' } },
      { status: 400 },
    );
  }

  // Generate insights
  const result = await generateInsights(parsed.data as unknown as AnalysisResult);

  if (!result.ok) {
    const statusCode =
      result.error.code === 'RATE_LIMITED' ? 429
      : result.error.code === 'TIMEOUT' ? 504
      : 503;
    return NextResponse.json({ ok: false, error: result.error }, { status: statusCode });
  }

  return NextResponse.json({ ok: true, data: result.value });
}
