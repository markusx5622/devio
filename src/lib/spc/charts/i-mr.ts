import type { Result } from '@/lib/utils/result';
import { ok, err } from '@/lib/utils/result';
import type { IMRChart, SpcError, Measurement } from '@/lib/spc/types';
import { SHEWHART_CONSTANTS } from '@/lib/spc/constants';
import { mean, movingRanges } from '@/lib/spc/stats/descriptive';

/**
 * Compute an Individuals and Moving Range (I-MR) control chart.
 *
 * Formulas — Montgomery, Introduction to Statistical Quality Control, 7th ed., §9.2:
 *   X̄  = mean of all individual observations
 *   MR̄ = mean of successive moving ranges (span 2)
 *
 *   Uses n=2 row from Shewhart table (E2 = 3/d2 for span-2 MR):
 *   UCL_I  = X̄ + E2 · MR̄
 *   CL_I   = X̄
 *   LCL_I  = X̄ − E2 · MR̄
 *
 *   UCL_MR = D4 · MR̄  (D4 = 3.267 for n=2)
 *   CL_MR  = MR̄
 *   LCL_MR = D3 · MR̄  (D3 = 0 for n=2)
 *
 * @param individuals  Individual measurements in time order (≥ 2 required).
 */
export function computeIMR(
  individuals: readonly Measurement[],
): Result<IMRChart, SpcError> {
  if (individuals.length < 2) {
    return err({
      kind: 'insufficient-data',
      message: 'I-MR chart requires at least 2 observations',
      minRequired: 2,
      actual: individuals.length,
    });
  }

  // n=2 row is used for all span-2 moving range calculations
  const k = SHEWHART_CONSTANTS[2];

  const values = individuals.map((m) => m.value);
  const processMean = mean(values);
  const mrs = movingRanges(values);
  const mrBar = mean(mrs);

  return ok({
    type: 'i-mr',
    individuals,
    movingRanges: mrs,
    processMean,
    averageMovingRange: mrBar,
    iLimits: {
      ucl: processMean + k.E2 * mrBar,
      cl: processMean,
      lcl: processMean - k.E2 * mrBar,
    },
    mrLimits: {
      ucl: k.D4 * mrBar,
      cl: mrBar,
      lcl: k.D3 * mrBar,
    },
  });
}
