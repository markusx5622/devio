/**
 * Domain types for the SPC (Statistical Process Control) engine.
 * All other modules import from here — no duplication.
 */

// ---------------------------------------------------------------------------
// Raw data
// ---------------------------------------------------------------------------

/** A single measured value, optionally annotated with time and a label. */
export interface Measurement {
  readonly value: number;
  /** ISO 8601 timestamp, e.g. "2024-01-15T08:30:00Z" */
  readonly timestamp?: string;
  /** Human-readable identifier for this observation. */
  readonly label?: string;
}

// ---------------------------------------------------------------------------
// Subgroups (used by X̄-R and X̄-S charts)
// ---------------------------------------------------------------------------

/**
 * A rational subgroup: a small collection of measurements taken under
 * essentially the same conditions, forming one plotted point on a variables
 * control chart.
 */
export interface Subgroup {
  /** Zero-based position in the data stream. */
  readonly index: number;
  readonly measurements: readonly Measurement[];
  /** Arithmetic mean of measurements in this subgroup. */
  readonly mean: number;
  /** max − min of measurements in this subgroup. */
  readonly range: number;
  /** Sample standard deviation (divisor n−1) of measurements in this subgroup. */
  readonly stdDev: number;
}

// ---------------------------------------------------------------------------
// Control limits
// ---------------------------------------------------------------------------

/**
 * The three-line structure displayed on every control chart.
 * UCL and LCL are typically set at ±3σ from the center line.
 */
export interface ControlLimits {
  /** Upper Control Limit. */
  readonly ucl: number;
  /** Center Line (process mean or average statistic). */
  readonly cl: number;
  /** Lower Control Limit (clamped to 0 when the statistic is non-negative). */
  readonly lcl: number;
}

// ---------------------------------------------------------------------------
// Chart types
// ---------------------------------------------------------------------------

/**
 * Identifies which pair of variables control charts is being used.
 * - `'xbar-r'`: X̄ and R charts — preferred for small subgroup sizes (n ≤ 10).
 * - `'xbar-s'`: X̄ and S charts — preferred for larger subgroup sizes (n > 10).
 * - `'i-mr'`:  Individuals and Moving Range charts — used when n = 1.
 */
export type ChartType = 'xbar-r' | 'xbar-s' | 'i-mr';

/** X̄-R control chart (means chart paired with ranges chart). */
export interface XbarRChart {
  readonly type: 'xbar-r';
  readonly subgroups: readonly Subgroup[];
  /** Limits for the X̄ (means) chart. */
  readonly xbarLimits: ControlLimits;
  /** Limits for the R (ranges) chart. */
  readonly rLimits: ControlLimits;
  /** Grand mean: average of all subgroup means (X̄̄). */
  readonly grandMean: number;
  /** Average range across all subgroups (R̄). */
  readonly averageRange: number;
}

/** X̄-S control chart (means chart paired with standard deviations chart). */
export interface XbarSChart {
  readonly type: 'xbar-s';
  readonly subgroups: readonly Subgroup[];
  /** Limits for the X̄ (means) chart. */
  readonly xbarLimits: ControlLimits;
  /** Limits for the S (standard deviations) chart. */
  readonly sLimits: ControlLimits;
  /** Grand mean: average of all subgroup means (X̄̄). */
  readonly grandMean: number;
  /** Average sample standard deviation across all subgroups (s̄). */
  readonly averageStdDev: number;
}

/**
 * Individuals and Moving Range chart.
 * Used when subgroup size is 1 (one measurement per time period).
 */
export interface IMRChart {
  readonly type: 'i-mr';
  /** The individual measurements in order. */
  readonly individuals: readonly Measurement[];
  /**
   * Successive absolute differences: MR_i = |X_i − X_{i−1}|.
   * Length is `individuals.length − 1`.
   */
  readonly movingRanges: readonly number[];
  /** Limits for the Individuals (I) chart. */
  readonly iLimits: ControlLimits;
  /** Limits for the Moving Range (MR) chart. */
  readonly mrLimits: ControlLimits;
  /** Overall process mean (X̄). */
  readonly processMean: number;
  /** Average moving range (MR̄). */
  readonly averageMovingRange: number;
}

/**
 * A fully computed variables control chart.
 * Narrow to a specific chart via `chart.type`.
 */
export type ControlChart = XbarRChart | XbarSChart | IMRChart;

// ---------------------------------------------------------------------------
// Nelson rules
// ---------------------------------------------------------------------------

/**
 * The eight Nelson (1984) rules for detecting non-random patterns on a
 * control chart. All zone boundaries assume ±1σ and ±2σ lines in addition
 * to the ±3σ control limits.
 *
 * - `'nelson-1'`: 1 point beyond ±3σ (outside control limits).
 * - `'nelson-2'`: 9 consecutive points on the same side of the center line.
 * - `'nelson-3'`: 6 consecutive points steadily increasing or decreasing.
 * - `'nelson-4'`: 14 consecutive points alternating up and down.
 * - `'nelson-5'`: 2 out of 3 consecutive points beyond ±2σ (same side).
 * - `'nelson-6'`: 4 out of 5 consecutive points beyond ±1σ (same side).
 * - `'nelson-7'`: 15 consecutive points within ±1σ (hugging the center line).
 * - `'nelson-8'`: 8 consecutive points beyond ±1σ on either side (bimodal).
 */
export type ViolationRule =
  | 'nelson-1'
  | 'nelson-2'
  | 'nelson-3'
  | 'nelson-4'
  | 'nelson-5'
  | 'nelson-6'
  | 'nelson-7'
  | 'nelson-8';

/** A detected out-of-control signal on a chart. */
export interface Violation {
  readonly rule: ViolationRule;
  /**
   * Indices into the chart's subgroup (or individual) array that triggered
   * this violation. For rules that reference a window of points, all points
   * in the window are listed.
   */
  readonly subgroupIndices: readonly number[];
  /** Human-readable explanation of the violation. */
  readonly description: string;
}

// ---------------------------------------------------------------------------
// Specification limits and process capability
// ---------------------------------------------------------------------------

/**
 * Engineering specification limits supplied by the user or drawing.
 * Required for capability index calculations.
 */
export interface SpecLimits {
  /** Upper Specification Limit. */
  readonly usl: number;
  /** Lower Specification Limit. */
  readonly lsl: number;
  /** Nominal / target value (optional). */
  readonly target?: number;
}

/**
 * Process capability and performance indices.
 *
 * Short-term (within-subgroup) indices use σ̂ estimated from R̄ or s̄:
 *   Cp  = (USL − LSL) / (6σ̂)
 *   Cpk = min[(USL − X̄̄), (X̄̄ − LSL)] / (3σ̂)
 *
 * Long-term (overall) indices use σ estimated from all individual data:
 *   Pp  = (USL − LSL) / (6σ)
 *   Ppk = min[(USL − X̄̄), (X̄̄ − LSL)] / (3σ)
 */
export interface ProcessCapability {
  /** Short-term potential capability (spread ratio). */
  readonly cp: number;
  /** Short-term actual capability (accounts for process centering). */
  readonly cpk: number;
  /** Long-term performance ratio. */
  readonly pp: number;
  /** Long-term performance index (accounts for process centering). */
  readonly ppk: number;
  /** Process sigma level: number of sigmas between mean and nearest spec limit. */
  readonly sigma: number;
}

// ---------------------------------------------------------------------------
// Top-level analysis result
// ---------------------------------------------------------------------------

/**
 * Complete output of a single SPC analysis run.
 * Returned (wrapped in `Result`) by the high-level `analyze` function.
 */
export interface AnalysisResult {
  readonly chart: ControlChart;
  /** All Nelson rule violations found on the chart (empty array = in control). */
  readonly violations: readonly Violation[];
  /**
   * Capability indices. Present only when `SpecLimits` were supplied to the
   * analysis; absent otherwise.
   */
  readonly capability?: ProcessCapability;
  /** `true` when `violations` is empty. */
  readonly isInControl: boolean;
  /** Number of subgroups (or individual observations for I-MR) plotted. */
  readonly subgroupCount: number;
  /** Total number of raw measurements that went into the analysis. */
  readonly totalMeasurements: number;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/**
 * Discriminated union of all errors that the SPC engine can produce.
 * Use the `kind` field to narrow to a specific variant.
 *
 * @example
 * ```ts
 * if (result.ok === false) {
 *   const err = result.error;
 *   if (err.kind === 'insufficient-data') {
 *     console.error(`Need at least ${err.minRequired} subgroups, got ${err.actual}`);
 *   }
 * }
 * ```
 */
export type SpcError =
  | {
      readonly kind: 'parse-error';
      readonly message: string;
      /** 1-based row number in the source file, if known. */
      readonly row?: number;
      /** Column name or header, if known. */
      readonly column?: string;
    }
  | {
      readonly kind: 'insufficient-data';
      readonly message: string;
      readonly minRequired: number;
      readonly actual: number;
    }
  | {
      readonly kind: 'invalid-subgroup-size';
      readonly message: string;
      readonly subgroupSize: number;
      /** Minimum valid subgroup size for this chart type. */
      readonly minSize: 2;
      /** Maximum valid subgroup size supported by the constants table. */
      readonly maxSize: 25;
    }
  | {
      readonly kind: 'missing-spec-limits';
      readonly message: string;
    }
  | {
      readonly kind: 'invalid-spec-limits';
      readonly message: string;
      readonly usl: number;
      readonly lsl: number;
    }
  | {
      readonly kind: 'calculation-error';
      readonly message: string;
      readonly cause?: unknown;
    };
