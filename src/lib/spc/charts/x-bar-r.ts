import type { Result } from '@/lib/utils/result';
import { ok, err } from '@/lib/utils/result';
import type { XbarRChart, SpcError } from '@/lib/spc/types';
import type { SubgroupSize } from '@/lib/spc/constants';
import { SHEWHART_CONSTANTS } from '@/lib/spc/constants';
import {
  buildSubgroups,
  grandMean,
  averageRange,
} from '@/lib/spc/stats/descriptive';
import type { Measurement } from '@/lib/spc/types';

/**
 * Compute an X̄-R control chart.
 *
 * Formulas — Montgomery, Introduction to Statistical Quality Control, 7th ed., §6.2:
 *   X̄̄  = grand mean of all subgroup means
 *   R̄   = average of all subgroup ranges
 *
 *   UCL_X̄ = X̄̄ + A2 · R̄
 *   CL_X̄  = X̄̄
 *   LCL_X̄ = X̄̄ − A2 · R̄
 *
 *   UCL_R  = D4 · R̄
 *   CL_R   = R̄
 *   LCL_R  = D3 · R̄  (= 0 for n ≤ 6)
 *
 * @param groups  Raw measurements per subgroup (2 ≤ n ≤ 25, ≥ 2 subgroups).
 */
export function computeXbarR(
  groups: readonly (readonly Measurement[])[],
): Result<XbarRChart, SpcError> {
  if (groups.length < 2) {
    return err({
      kind: 'insufficient-data',
      message: 'X̄-R chart requires at least 2 subgroups',
      minRequired: 2,
      actual: groups.length,
    });
  }

  const n = groups[0]!.length;
  if (n < 2 || n > 25) {
    return err({
      kind: 'invalid-subgroup-size',
      message: `Subgroup size must be between 2 and 25, got ${n}`,
      subgroupSize: n,
      minSize: 2,
      maxSize: 25,
    });
  }

  // Validate all subgroups have the same size
  for (let i = 1; i < groups.length; i++) {
    if (groups[i]!.length !== n) {
      return err({
        kind: 'invalid-subgroup-size',
        message: `Subgroup ${i} has size ${groups[i]!.length}, expected ${n}`,
        subgroupSize: groups[i]!.length,
        minSize: 2,
        maxSize: 25,
      });
    }
  }

  const k = SHEWHART_CONSTANTS[n as SubgroupSize];
  const subgroups = buildSubgroups(groups);
  const xdbarbar = grandMean(subgroups);
  const rBar = averageRange(subgroups);

  return ok({
    type: 'xbar-r',
    subgroups,
    grandMean: xdbarbar,
    averageRange: rBar,
    xbarLimits: {
      ucl: xdbarbar + k.A2 * rBar,
      cl: xdbarbar,
      lcl: xdbarbar - k.A2 * rBar,
    },
    rLimits: {
      ucl: k.D4 * rBar,
      cl: rBar,
      lcl: k.D3 * rBar,
    },
  });
}
