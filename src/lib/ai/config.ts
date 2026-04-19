/**
 * Reads AI configuration from environment variables.
 * Throws a descriptive error at call time if ANTHROPIC_API_KEY is missing,
 * so failures are caught early rather than at request time.
 */

export function requireApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      'Missing ANTHROPIC_API_KEY. Copy .env.example to .env.local and add your Anthropic API key.',
    );
  }
  return key;
}

/** Claude model used for SPC insights generation. */
export const AI_MODEL =
  process.env.AI_MODEL ?? 'claude-haiku-4-5-20251001';

/** Maximum tokens allowed in the AI response. */
export const AI_MAX_TOKENS = 2048;

/** Request timeout in milliseconds. */
export const AI_TIMEOUT_MS = 30_000;
