/**
 * EO Data Quality — cloud masking, observation counting, confidence bands.
 *
 * The Sentinel-2 Statistical API returns per-interval statistics. We use:
 *  - sampleCount: total pixel samples in the polygon for the interval
 *  - noDataCount: pixels masked out (cloud, shadow, water) via SCL
 *
 * Valid fraction = (sampleCount - noDataCount) / sampleCount
 * We require ≥ 30% valid pixels per interval, otherwise mark as "cloud-contaminated".
 *
 * For the phenology score we only use months with valid coverage.
 * We surface data quality on the DPP as "X of 12 months had valid satellite data".
 */

export interface IntervalQuality {
  period: string;          // "2025-09"
  ndviMean: number;
  ndviMax: number;
  validFraction: number;   // 0-1; <0.30 = contaminated
  isValid: boolean;
  cloudFlag: boolean;
}

export interface DataQualityReport {
  totalIntervals: number;
  validIntervals: number;
  cloudContaminatedIntervals: number;
  coveragePercent: number;  // valid / total * 100
  dataQualityLabel: "excellent" | "good" | "fair" | "poor";
  notes: string[];
}

/**
 * Parse raw Sentinel Hub statistics output into quality-annotated intervals.
 * The API returns sampleCount / noDataCount when we include them in the evalscript output.
 */
export function parseIntervals(
  rawData: {
    interval: { from: string };
    outputs: {
      ndvi: { bands: { B0: { stats: { mean: number; max: number; sampleCount: number; noDataCount: number } } } };
    };
  }[]
): IntervalQuality[] {
  return rawData.map(d => {
    const stats = d.outputs?.ndvi?.bands?.B0?.stats;
    const sampleCount = stats?.sampleCount ?? 0;
    const noDataCount = stats?.noDataCount ?? 0;
    const validPixels = Math.max(0, sampleCount - noDataCount);
    const validFraction = sampleCount > 0 ? validPixels / sampleCount : 0;
    const isValid = validFraction >= 0.30 && sampleCount > 0;

    return {
      period: d.interval.from.slice(0, 7),
      ndviMean: parseFloat((Number.isFinite(stats?.mean) ? stats.mean : 0).toFixed(3)),
      ndviMax: parseFloat((Number.isFinite(stats?.max) ? stats.max : 0).toFixed(3)),
      validFraction: parseFloat(validFraction.toFixed(3)),
      isValid,
      cloudFlag: !isValid && sampleCount > 0,
    };
  });
}

/** Deduplicate by month, preferring highest valid fraction then highest NDVI */
export function deduplicateByMonth(intervals: IntervalQuality[]): IntervalQuality[] {
  const byMonth: Record<string, IntervalQuality> = {};
  for (const iv of intervals) {
    const existing = byMonth[iv.period];
    if (!existing) { byMonth[iv.period] = iv; continue; }
    // Prefer valid over invalid; then prefer higher valid fraction; then higher NDVI
    if (iv.isValid && !existing.isValid) { byMonth[iv.period] = iv; continue; }
    if (!iv.isValid && existing.isValid) continue;
    if (iv.validFraction > existing.validFraction) { byMonth[iv.period] = iv; continue; }
    if (iv.ndviMean > existing.ndviMean) byMonth[iv.period] = iv;
  }
  return Object.values(byMonth).sort((a, b) => a.period.localeCompare(b.period));
}

export function buildQualityReport(intervals: IntervalQuality[]): DataQualityReport {
  const valid = intervals.filter(i => i.isValid);
  const cloudy = intervals.filter(i => i.cloudFlag);
  const coveragePercent = intervals.length > 0 ? Math.round((valid.length / intervals.length) * 100) : 0;

  let dataQualityLabel: DataQualityReport["dataQualityLabel"];
  if (coveragePercent >= 80) dataQualityLabel = "excellent";
  else if (coveragePercent >= 60) dataQualityLabel = "good";
  else if (coveragePercent >= 40) dataQualityLabel = "fair";
  else dataQualityLabel = "poor";

  const notes: string[] = [];
  if (cloudy.length > 0) notes.push(`${cloudy.length} interval(s) excluded due to cloud/shadow contamination (< 30% valid pixels).`);
  if (valid.length < 6) notes.push("Fewer than 6 valid monthly observations — phenology score may be less reliable.");
  if (coveragePercent === 100) notes.push("Full annual coverage achieved — all 12 months had valid satellite data.");

  return {
    totalIntervals: intervals.length,
    validIntervals: valid.length,
    cloudContaminatedIntervals: cloudy.length,
    coveragePercent,
    dataQualityLabel,
    notes,
  };
}
