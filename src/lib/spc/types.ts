// ============================================================================
// src/lib/spc/types.ts — Devio SPC Domain Model
// 
// Authoritative type definitions for the SPC engine.
// All types are immutable (readonly). No classes. No `any`.
// 
// References:
//   - Montgomery, D.C. "Introduction to Statistical Quality Control", 8th ed.
//   - Nelson, L.S. "The Shewhart Control Chart — Tests for Special Causes",
//     Journal of Quality Technology, 16(4), 1984, pp. 237–239.
//   - AIAG SPC Reference Manual, 2nd ed.
// ============================================================================

import type { Result } from "@/lib/utils/result";

// ────────────────────────────────────────────────────────────────────────────
// 1. Measurement
// ────────────────────────────────────────────────────────────────────────────

/** A single observation taken from a process. */
export interface Measurement {
  /** Observed numeric value. */
  readonly value: number;
  /** Timestamp of when the measurement was taken. */
  readonly timestamp: Date;
  /** Free-form label for traceability (operator, machine, lot…). */
  readonly label?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// 2. Subgroup
// ────────────────────────────────────────────────────────────────────────────

/** A rational sample of measurements taken together under the same conditions. */
export interface Subgroup {
  /** Ordinal index of the subgroup (1-based, collection order). */
  readonly index: number;
  /** Measurements composing the subgroup. At least 1 element. */
  readonly measurements: readonly Measurement[];
  /** Subgroup size (n). Equal to measurements.length; explicit for validation. */
  readonly size: number;
}

// ────────────────────────────────────────────────────────────────────────────
// 3. ChartType
// ────────────────────────────────────────────────────────────────────────────

/** X̄-R chart: monitors subgroup means and ranges (2 ≤ n ≤ 10). */
interface XBarRChart {
  readonly kind: "x-bar-r";
  readonly subgroupSize: number;
}

/** X̄-S chart: monitors subgroup means and std deviations (n ≥ 11 typical). */
interface XBarSChart {
  readonly kind: "x-bar-s";
  readonly subgroupSize: number;
}

/** Individuals and Moving Range chart (n = 1). */
interface IMRChart {
  readonly kind: "i-mr";
}

/**
 * Variable control chart types supported in v1.
 * v2 extension point: add AttributeChartType and union into ChartType.
 */
export type VariableChartType = XBarRChart | XBarSChart | IMRChart;

export type ChartType = VariableChartType;
// v2: export type ChartType = VariableChartType | AttributeChartType;

// ────────────────────────────────────────────────────────────────────────────
// 4. ControlLimits
// ────────────────────────────────────────────────────────────────────────────

/**
 * Calculated control limits for a single chart.
 * Ref: Montgomery §6.2 — 3-sigma limits derived from within-subgroup variation.
 */
export interface ControlLimits {
  /** Upper Control Limit — CL + 3σ̂. */
  readonly ucl: number;
  /** Center Line — mean of the monitored statistic. */
  readonly cl: number;
  /** Lower Control Limit — CL − 3σ̂. May be negative before clamping. */
  readonly lcl: number;
}

// ────────────────────────────────────────────────────────────────────────────
// 5. Nelson Rules & Violations
// ────────────────────────────────────────────────────────────────────────────

/**
 * Literal identifiers for the 8 Nelson rules.
 * Ref: Nelson, L.S. JQT 16(4), 1984.
 *
 *   nelson-1:  1 point beyond ±3σ
 *   nelson-2:  9 consecutive points on the same side of CL
 *   nelson-3:  6 consecutive points steadily increasing or decreasing
 *   nelson-4:  14 consecutive points alternating up and down
 *   nelson-5:  2 of 3 consecutive points beyond ±2σ (same side)
 *   nelson-6:  4 of 5 consecutive points beyond ±1σ (same side)
 *   nelson-7:  15 consecutive points within ±1σ (stratification)
 *   nelson-8:  8 consecutive points beyond ±1σ (both sides)
 */
export type NelsonRuleId =
  | "nelson-1"
  | "nelson-2"
  | "nelson-3"
  | "nelson-4"
  | "nelson-5"
  | "nelson-6"
  | "nelson-7"
  | "nelson-8";

/** All 8 Nelson rule IDs as a readonly tuple for iteration. */
export const ALL_NELSON_RULE_IDS: readonly NelsonRuleId[] = [
  "nelson-1",
  "nelson-2",
  "nelson-3",
  "nelson-4",
  "nelson-5",
  "nelson-6",
  "nelson-7",
  "nelson-8",
] as const;

/** A concrete violation detected at a specific location in the chart. */
export interface Violation {
  /** Which rule was violated. */
  readonly ruleId: NelsonRuleId;
  /**
   * Subgroup indices involved in the violation (1-based, chronological).
   * Rule 1: single index. Rule 2: 9 indices of the run. Never empty.
   */
  readonly subgroupIndices: readonly number[];
  /**
   * Trigger point — the subgroup where the violation becomes detectable.
   * Always the last element of subgroupIndices.
   */
  readonly triggerIndex: number;
  /** Human-readable message for UI tooltips. Generated by the detection function. */
  readonly message: string;
}

/**
 * Static definition of a Nelson rule (metadata + detector).
 * Lives in the rule registry, not instantiated per violation.
 */
export interface ViolationRule {
  /** Type-safe identifier. */
  readonly id: NelsonRuleId;
  /** Short display name: "Rule 1", "Rule 2", etc. */
  readonly shortName: string;
  /** Readable description of the condition. */
  readonly description: string;
  /** Minimum consecutive points the rule needs to evaluate. */
  readonly windowSize: number;
  /**
   * Pure detection function.
   * Receives chart points and limits, returns all violations found.
   */
  readonly detect: (
    points: readonly ChartPoint[],
    limits: ControlLimits,
  ) => readonly Violation[];
}

// ────────────────────────────────────────────────────────────────────────────
// 6. ControlChart
// ────────────────────────────────────────────────────────────────────────────

/**
 * An annotated point on the control chart.
 * Correction applied: violations are NOT embedded here.
 * They live as a separate array in SingleChart, indexed by triggerIndex.
 * Rationale: simpler pipeline (no rebuild), cheaper toggles of rules in UI.
 */
export interface ChartPoint {
  /** Subgroup index this point belongs to (1-based). */
  readonly subgroupIndex: number;
  /** Value of the plotted statistic (x̄, R, S, xᵢ, MR…). */
  readonly value: number;
}

/**
 * A single sub-chart (e.g., the X̄ chart or the R chart).
 * Violations are stored as a flat array, linked to points via triggerIndex.
 */
export interface SingleChart {
  /** Display label: "X-bar", "R", "S", "Individuals", "MR". */
  readonly label: string;
  /** Calculated control limits for this sub-chart. */
  readonly limits: ControlLimits;
  /** Plotted points of the monitored statistic. */
  readonly points: readonly ChartPoint[];
  /** Violations detected on this sub-chart. */
  readonly violations: readonly Violation[];
}

/** Complete control chart result — output of analyzing a dataset with a ChartType. */
export interface ControlChart {
  /** Chart type that produced this result. */
  readonly chartType: ChartType;
  /** Primary sub-chart (X̄, Individuals). */
  readonly primary: SingleChart;
  /** Secondary sub-chart (R, S, MR). null for charts without a companion. */
  readonly secondary: SingleChart | null;
  /** Number of subgroups analyzed. */
  readonly subgroupCount: number;
}

// ────────────────────────────────────────────────────────────────────────────
// 7. Specification Limits & Process Capability
// ────────────────────────────────────────────────────────────────────────────

/**
 * Engineering specification limits. At least one bound must be present.
 * Ref: Montgomery §7.2 — "Process Capability Analysis".
 */
export type SpecificationLimits =
  | {
      readonly kind: "bilateral";
      readonly usl: number;
      readonly lsl: number;
      readonly target?: number;
    }
  | {
      readonly kind: "upper-only";
      readonly usl: number;
      readonly target?: number;
    }
  | {
      readonly kind: "lower-only";
      readonly lsl: number;
      readonly target?: number;
    };

/**
 * Categorical interpretation of a capability index.
 * Thresholds per industry convention (Montgomery §7.2, AIAG SPC Reference Manual):
 *   index ≥ 1.67 → "excellent"
 *   index ≥ 1.33 → "capable"
 *   index ≥ 1.00 → "marginal"
 *   index < 1.00 → "incapable"
 */
export type CapabilityVerdict =
  | "excellent"
  | "capable"
  | "marginal"
  | "incapable";

/** A single capability index with its computed value and interpretation. */
export interface CapabilityIndex {
  /** Numeric value of the index. */
  readonly value: number;
  /** Categorical verdict based on standard thresholds. */
  readonly verdict: CapabilityVerdict;
}

/**
 * Process capability analysis result.
 * Bilateral specs yield Cp, Cpk, Pp, Ppk.
 * Unilateral specs yield only Cpk and Ppk (Cp/Pp require both limits).
 */
export type ProcessCapability =
  | {
      readonly kind: "bilateral";
      readonly specLimits: Extract<SpecificationLimits, { kind: "bilateral" }>;
      /** Cp — potential capability (short-term, within-subgroup σ̂). */
      readonly cp: CapabilityIndex;
      /** Cpk — actual capability (short-term, penalizes off-center). */
      readonly cpk: CapabilityIndex;
      /** Pp — potential performance (long-term, overall σ̂). */
      readonly pp: CapabilityIndex;
      /** Ppk — actual performance (long-term, penalizes off-center). */
      readonly ppk: CapabilityIndex;
    }
  | {
      readonly kind: "unilateral";
      readonly specLimits: Exclude<SpecificationLimits, { kind: "bilateral" }>;
      /** Cpk — unilateral capability (short-term). */
      readonly cpk: CapabilityIndex;
      /** Ppk — unilateral performance (long-term). */
      readonly ppk: CapabilityIndex;
    };

// ────────────────────────────────────────────────────────────────────────────
// 8. SpcError
// ────────────────────────────────────────────────────────────────────────────

/** Discriminated union of domain errors. Used with Result<T, SpcError>. */
export type SpcError =
  | {
      readonly code: "INVALID_MEASUREMENT";
      readonly message: string;
      /** 0-based index of the problematic measurement in the raw dataset. */
      readonly measurementIndex: number;
      /** The value that caused rejection. */
      readonly rawValue: unknown;
    }
  | {
      readonly code: "INSUFFICIENT_DATA";
      readonly message: string;
      /** Subgroups received. */
      readonly received: number;
      /** Minimum required for the requested chart type. */
      readonly required: number;
    }
  | {
      readonly code: "SUBGROUP_SIZE_MISMATCH";
      readonly message: string;
      /** Expected size per the ChartType. */
      readonly expectedSize: number;
      /** 1-based indices of mismatched subgroups. */
      readonly mismatchedIndices: readonly number[];
    }
  | {
      readonly code: "INVALID_SPEC_LIMITS";
      readonly message: string;
      readonly reason: "lsl_gte_usl" | "non_finite" | "missing_for_bilateral";
    }
  | {
      readonly code: "ZERO_VARIANCE";
      readonly message: string;
    }
  | {
      readonly code: "CHART_TYPE_INCOMPATIBLE";
      readonly message: string;
      readonly requestedChart: ChartType["kind"];
      readonly reason: string;
    }
  | {
      readonly code: "PARSE_ERROR";
      readonly message: string;
      /** 1-based row in the source file. */
      readonly row?: number;
      /** Column name in the source file. */
      readonly column?: string;
    };

// ────────────────────────────────────────────────────────────────────────────
// 9. Analysis Result (correction #1: split Output vs Result)
// ────────────────────────────────────────────────────────────────────────────

/** Statistical summary of the analyzed dataset. */
export interface DatasetSummary {
  /** Total number of individual measurements. */
  readonly totalMeasurements: number;
  /** Number of subgroups. */
  readonly subgroupCount: number;
  /** Subgroup size: constant n, or { min, max } if variable. */
  readonly subgroupSize: number | { readonly min: number; readonly max: number };
  /** Grand mean of the process (x̄̄). */
  readonly processMean: number;
  /** Overall standard deviation (σ̂_overall). */
  readonly processStdDev: number;
  /** Time range of the dataset, null if timestamps unavailable. */
  readonly timeRange: { readonly from: Date; readonly to: Date } | null;
}

/** Pre-computed violation summary for dashboard indicators. */
export interface ViolationSummary {
  /** Total violations detected across both sub-charts. */
  readonly totalCount: number;
  /** Breakdown by rule — every NelsonRuleId present, even if 0. */
  readonly countByRule: Readonly<Record<NelsonRuleId, number>>;
  /** Is the process in statistical control? (totalCount === 0). */
  readonly inControl: boolean;
}

/**
 * Pure output of the SPC engine. No runtime metadata.
 * This is what analyzeProcess() returns inside Result.
 * The engine is 100% pure — no I/O, no side effects, no Date.now().
 */
export interface AnalysisOutput {
  /** Chart type used in the analysis. */
  readonly chartType: ChartType;
  /** Statistical summary of the dataset. */
  readonly dataset: DatasetSummary;
  /** Control chart with annotated points, limits, and violations. */
  readonly chart: ControlChart;
  /** Pre-computed violation summary. */
  readonly violations: ViolationSummary;
  /**
   * Process capability. null if the user did not provide spec limits.
   * Dashboard conditionally renders the capability section.
   */
  readonly capability: ProcessCapability | null;
}

/**
 * What the UI receives — AnalysisOutput enriched with runtime metadata.
 * Constructed by the API/orchestration layer, NOT by the SPC engine.
 *
 * Usage:
 *   const output = analyzeProcess(data, options);  // pure
 *   if (!output.ok) return handleError(output.error);
 *   const result: AnalysisResult = { ...output.value, analyzedAt: new Date() };
 */
export interface AnalysisResult extends AnalysisOutput {
  /** When the analysis was performed. Added by the orchestration layer. */
  readonly analyzedAt: Date;
}

// ────────────────────────────────────────────────────────────────────────────
// 10. Engine Input Types
// ────────────────────────────────────────────────────────────────────────────

/**
 * Raw data input for the engine. Discriminated union to support both
 * flat (individual measurements) and pre-grouped formats.
 */
export type RawDataInput =
  | {
      /** Individual measurements — engine groups into subgroups of n=1 or per options. */
      readonly kind: "flat";
      readonly values: readonly number[];
      readonly timestamps?: readonly Date[];
      readonly labels?: readonly string[];
    }
  | {
      /** Pre-grouped measurements. Each inner array is one subgroup. */
      readonly kind: "grouped";
      readonly groups: readonly (readonly number[])[];
      readonly timestamps?: readonly Date[];
      readonly labels?: readonly string[];
    };

/**
 * Options for the analysis pipeline.
 * chartType is required — the engine does not auto-detect.
 */
export interface AnalysisOptions {
  /** Control chart type to generate. Required. */
  readonly chartType: ChartType;
  /** Specification limits. null or omitted = skip capability analysis. */
  readonly specLimits?: SpecificationLimits | null;
  /**
   * Nelson rules to evaluate. Default: all 8 (ALL_NELSON_RULE_IDS).
   * Empty array = skip violation detection entirely.
   */
  readonly nelsonRules?: readonly NelsonRuleId[];
  /**
   * Subgroup size for grouping flat data into subgroups.
   * Ignored when RawDataInput.kind === "grouped".
   * Default: derived from chartType.subgroupSize (or 1 for I-MR).
   */
  readonly subgroupSize?: number;
}