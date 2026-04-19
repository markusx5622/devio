import type { Result } from '@/lib/utils/result';
import { ok, err } from '@/lib/utils/result';
import type { XbarSChart, SpcError, Measurement } from '@/lib/spc/types';
import type { SubgroupSize } from '@/lib/spc/constants';
import { SHEWHART_CONSTANTS } from '@/lib/spc/constants';
import {
  buildSubgroups,
  grandMean,
  averageStdDev,
} from '@/lib/spc/stats/descriptive';

/**
 * Compute an X̄-S control chart.
 *
 * Formulas — Montgomery, Introduction to Statistical Quality Control, 7th ed., §6.4:
 *   X̄̄  = grand mean of all subgroup means
 *   s̄   = average of all subgroup sample standard deviations
 *
 *   UCL_X̄ = X̄̄ + A3 · s̄
 *   CL_X̄  = X̄̄
 *   LCL_X̄ = X̄̄ − A3 · s̄
 *
 *   UCL_S  = B4 · s̄
 *   CL_S   = s̄
 *   LCL_S  = B3 · s̄  (= 0 for n ≤ 5)
 *
 * @param groups  Raw measurements per subgroup (2 ≤ n ≤ 25, ≥ 2 subgroups).
 */
export function computeXbarS(
  groups: readonly (readonly Measurement[])[],
): Result<XbarSChart, SpcError> {
  if (groups.length < 2) {
    return err({
      kind: 'insufficient-data',
      message: 'X̄-S chart requires at least 2 subgroups',
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
  const xbarbar = grandMean(subgroups);
  const sBar = averageStdDev(subgroups);

  return ok({
    type: 'xbar-s',
    subgroups,
    grandMean: xbarbar,
    averageStdDev: sBar,
    xbarLimits: {
      ucl: xbarbar + k.A3 * sBar,
      cl: xbarbar,
      lcl: xbarbar - k.A3 * sBar,
    },
    sLimits: {
      ucl: k.B4 * sBar,
      cl: sBar,
      lcl: k.B3 * sBar,
    },
  });
}
