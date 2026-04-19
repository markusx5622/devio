import type { AnalysisResult } from '@/lib/spc/types';

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPT_SPC = `You are an expert SPC (Statistical Process Control) engineer and Six Sigma Black Belt. Your role is to analyze control chart data and provide actionable process improvement insights in Spanish.

## Your expertise covers:
- Shewhart variables control charts: X̄-R, X̄-S, and Individuals & Moving Range (I-MR)
- Nelson (1984) rules for detecting non-random patterns:
  - Rule 1: 1 point beyond ±3σ → assignable cause, investigate immediately
  - Rule 2: 9 consecutive points same side of centerline → process mean shift
  - Rule 3: 6 consecutive points trending monotonically → systematic drift
  - Rule 4: 14 consecutive points alternating → two alternating sources of variation
  - Rule 5: 2 of 3 consecutive points beyond ±2σ same side → moderate mean shift
  - Rule 6: 4 of 5 consecutive points beyond ±1σ same side → minor but sustained shift
  - Rule 7: 15 consecutive points within ±1σ → stratification or wrong limits
  - Rule 8: 8 consecutive points beyond ±1σ both sides → bimodal distribution / mixture
- Capability index interpretation thresholds (Montgomery 7th ed.):
  - Cpk / Ppk ≥ 1.67 → Excellent (Six Sigma quality)
  - Cpk / Ppk ≥ 1.33 → Adequate (meets requirements)
  - Cpk / Ppk ≥ 1.00 → Marginal (barely capable)
  - Cpk / Ppk < 1.00 → Inadequate (process not capable)
- 6M Ishikawa root cause categories: Máquina (Machine), Método (Method), Material, Mano de obra (Man), Medio ambiente (Environment), Medición (Measurement)
- DMAIC methodology for process improvement

## Response rules:
- Respond ONLY in valid JSON — no markdown, no prose outside JSON
- All text values must be in Spanish
- Root causes must reference relevant 6M categories
- Actions must be specific and actionable
- Keep summary under 3 sentences

## Required JSON schema (respond with exactly this structure):
{
  "summary": "string — 1-3 sentence overall process assessment in Spanish",
  "processStatus": "in-control" | "out-of-control" | "marginally-stable",
  "violations": [
    {
      "rule": number,
      "interpretation": "string — what this pattern means for the process",
      "rootCauses": ["string — potential root cause referencing 6M category"],
      "actions": ["string — specific corrective action"]
    }
  ],
  "capability": {
    "assessment": "string — interpretation of Cp/Cpk/Pp/Ppk values",
    "recommendation": "string — specific recommendation to improve capability"
  },
  "dmaic": {
    "define": "string — problem definition based on the data",
    "measure": "string — what additional data or measurements to collect",
    "analyze": "string — analytical approach to identify root causes",
    "improve": "string — improvement actions to implement",
    "control": "string — control methods to sustain improvements"
  },
  "urgency": "immediate" | "monitor" | "acceptable"
}`;

// ---------------------------------------------------------------------------
// User prompt builder
// ---------------------------------------------------------------------------

export function buildUserPrompt(analysis: AnalysisResult): string {
  const { chart, violations, capability, isInControl, subgroupCount, totalMeasurements } = analysis;

  const chartTypeLabel =
    chart.type === 'xbar-r' ? 'X̄-R' : chart.type === 'xbar-s' ? 'X̄-S' : 'I-MR';

  const centerLine =
    chart.type === 'i-mr' ? chart.processMean : chart.grandMean;

  const xLimits =
    chart.type === 'xbar-r' ? chart.xbarLimits
    : chart.type === 'xbar-s' ? chart.xbarLimits
    : chart.iLimits;

  const violationsSummary =
    violations.length === 0
      ? 'No se detectaron violaciones — proceso bajo control estadístico.'
      : violations
          .map((v) => {
            const ruleNum = Number(v.rule.replace('nelson-', ''));
            const indices = v.subgroupIndices.map((i) => i + 1).join(', ');
            return `  - Regla ${ruleNum}: puntos [${indices}] — ${v.description}`;
          })
          .join('\n');

  const capabilitySection = capability
    ? `Cp=${capability.cp.toFixed(3)}, Cpk=${capability.cpk.toFixed(3)}, Pp=${capability.pp.toFixed(3)}, Ppk=${capability.ppk.toFixed(3)}, Sigma=${capability.sigma.toFixed(2)}σ`
    : 'No disponible (no se proporcionaron límites de especificación)';

  return `Analiza los siguientes datos de control estadístico de procesos y proporciona interpretaciones y recomendaciones en español.

## Datos del análisis

**Tipo de carta:** ${chartTypeLabel}
**Subgrupos / Observaciones:** ${subgroupCount}
**Total de mediciones:** ${totalMeasurements}
**Estado de control:** ${isInControl ? 'Bajo control estadístico' : 'FUERA DE CONTROL ESTADÍSTICO'}

## Parámetros del proceso

**Media del proceso (línea central):** ${centerLine.toFixed(4)}
**UCL (Límite de Control Superior):** ${xLimits.ucl.toFixed(4)}
**LCL (Límite de Control Inferior):** ${xLimits.lcl.toFixed(4)}
**Amplitud de control (UCL - LCL):** ${(xLimits.ucl - xLimits.lcl).toFixed(4)}

## Violaciones de reglas de Nelson (${violations.length} detectadas)

${violationsSummary}

## Índices de capacidad

${capabilitySection}

Proporciona un análisis completo con diagnóstico, causas raíz potenciales usando las 6M del diagrama de Ishikawa, y acciones correctivas priorizadas. Responde ÚNICAMENTE con el JSON especificado.`;
}
