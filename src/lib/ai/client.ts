import Anthropic from '@anthropic-ai/sdk';
import type { AnalysisResult } from '@/lib/spc/types';
import { SYSTEM_PROMPT_SPC, buildUserPrompt } from './prompts';
import { SpcInsightsSchema, type SpcInsights, type AiError } from './types';
import { AI_MODEL, AI_MAX_TOKENS, AI_TIMEOUT_MS, requireApiKey } from './config';

// ---------------------------------------------------------------------------
// Client (lazy-initialized)
// ---------------------------------------------------------------------------

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: requireApiKey() });
  }
  return _client;
}

// ---------------------------------------------------------------------------
// generateInsights
// ---------------------------------------------------------------------------

type GenerateResult =
  | { ok: true; value: SpcInsights }
  | { ok: false; error: AiError };

export async function generateInsights(
  analysis: AnalysisResult,
): Promise<GenerateResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const client = getClient();
    const userPrompt = buildUserPrompt(analysis);

    const message = await client.messages.create(
      {
        model: AI_MODEL,
        max_tokens: AI_MAX_TOKENS,
        system: SYSTEM_PROMPT_SPC,
        messages: [{ role: 'user', content: userPrompt }],
      },
      { signal: controller.signal },
    );

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return {
        ok: false,
        error: { code: 'PARSE_ERROR', message: 'La respuesta de la IA no contiene texto.' },
      };
    }

    // Strip possible markdown code fences
    const raw = textBlock.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        ok: false,
        error: { code: 'PARSE_ERROR', message: 'La IA devolvió JSON inválido.' },
      };
    }

    const result = SpcInsightsSchema.safeParse(parsed);
    if (!result.success) {
      return {
        ok: false,
        error: {
          code: 'PARSE_ERROR',
          message: `La respuesta de la IA no cumple el esquema esperado: ${result.error.issues[0]?.message ?? 'error desconocido'}`,
        },
      };
    }

    return { ok: true, value: result.data };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        ok: false,
        error: { code: 'TIMEOUT', message: 'El análisis de IA tardó demasiado. Intenta de nuevo.' },
      };
    }

    const status = (err as { status?: number }).status;
    if (status === 429) {
      return {
        ok: false,
        error: { code: 'RATE_LIMITED', message: 'Límite de solicitudes de IA alcanzado. Espera un momento.' },
      };
    }

    const message =
      err instanceof Error ? err.message : 'Error desconocido al contactar la IA.';
    return {
      ok: false,
      error: { code: 'API_ERROR', message },
    };
  } finally {
    clearTimeout(timer);
  }
}
