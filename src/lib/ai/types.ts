import { z } from 'zod';

// ---------------------------------------------------------------------------
// SpcInsights — structured SPC analysis response
// ---------------------------------------------------------------------------

const ViolationInsightSchema = z.object({
  rule: z.number().int().min(1).max(8),
  interpretation: z.string(),
  rootCauses: z.array(z.string()),
  actions: z.array(z.string()),
});

const CapabilityInsightSchema = z.object({
  assessment: z.string(),
  recommendation: z.string(),
});

const DmaicSchema = z.object({
  define: z.string(),
  measure: z.string(),
  analyze: z.string(),
  improve: z.string(),
  control: z.string(),
});

export const SpcInsightsSchema = z.object({
  summary: z.string(),
  processStatus: z.enum(['in-control', 'out-of-control', 'marginally-stable']),
  violations: z.array(ViolationInsightSchema),
  capability: CapabilityInsightSchema,
  dmaic: DmaicSchema,
  urgency: z.enum(['immediate', 'monitor', 'acceptable']),
});

export type SpcInsights = z.infer<typeof SpcInsightsSchema>;
