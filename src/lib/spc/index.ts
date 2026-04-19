// Domain types
export type {
  Measurement,
  Subgroup,
  ControlLimits,
  ChartType,
  XbarRChart,
  XbarSChart,
  IMRChart,
  ControlChart,
  ViolationRule,
  Violation,
  SpecLimits,
  ProcessCapability,
  AnalysisResult,
  SpcError,
} from './types';

// Constants
export { SHEWHART_CONSTANTS } from './constants';
export type { SubgroupSize, ShewhartConstants } from './constants';

// Parsers
export { parseCsv, parseXlsx, detectLayout } from './parsers';
export type { ParsedTable, DataLayout } from './parsers';

// Statistics
export {
  mean,
  range,
  stdDev,
  stdDevPopulation,
  movingRanges,
  buildSubgroups,
  grandMean,
  averageRange,
  averageStdDev,
  allValues,
} from './stats';

// Chart calculators
export { computeXbarR, computeXbarS, computeIMR } from './charts';

// Nelson rules
export { detectNelsonViolations } from './rules';

// Capability
export { computeCapability, categorize } from './capability';
export type { CapabilityCategory } from './capability';

// Orchestrator
export { analyzeProcess } from './analyze';
export type { ChartInput, AnalyzeOptions } from './analyze';
