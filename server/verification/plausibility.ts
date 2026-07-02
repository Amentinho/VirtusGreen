/**
 * Layer 3 — Area-to-Yield Plausibility Check
 *
 * Compares the claimed harvest quantity against the maximum realistic yield
 * for the registered plot area and crop type.
 *
 * Yield benchmarks are drawn from:
 *  - Bronte pistachio: ISTAT agricultural census, Consorzio del Pistacchio di Bronte data
 *  - Etna DOC: disciplinare di produzione (max 9 t/ha grapes → ~6 t/ha wine)
 *  - Modica cocoa: FAO GAEZ data for São Tomé
 *  - Yubari melon: Hokkaido agricultural statistics
 */

export interface PlausibilityResult {
  plausible: boolean;
  claimedKg: number;
  plotAreaHa: number;
  maxRealisticKg: number;
  yieldKgPerHa: number;
  benchmarkKgPerHa: { min: number; max: number };
  benchmarkSource: string;
  flags: string[];
}

// Yield benchmarks per crop [min kg/ha, max kg/ha] and source
const YIELD_BENCHMARKS: Record<string, {
  min: number;
  max: number;
  source: string;
  notes: string;
}> = {
  bronte: {
    // On-year yield ~800-1200 kg/ha fresh weight (600-900 kg/ha dried)
    // Off-year: 200-400 kg/ha. Using fresh weight to match producer claims.
    min: 200,
    max: 1400,
    source: "ISTAT 2023 + Consorzio Pistacchio di Bronte",
    notes: "Biennial bearer. On-year max ~1,200 kg/ha. Off-year min ~200 kg/ha.",
  },
  etna: {
    // Etna DOC disciplinare: max 9,000 kg/ha grapes for Etna Rosso
    // Adding 15% tolerance for measurement uncertainty
    min: 500,
    max: 10350,
    source: "Disciplinare Etna DOC DM 11/08/2011 — max resa 9,000 kg/ha uva",
    notes: "Maximum resa per disciplinare: 9 t/ha. Claim above 10.35 t/ha triggers flag.",
  },
  modica: {
    // São Tomé cocoa: FAO GAEZ ~300-600 kg/ha dry beans
    // Modica chocolate uses ~40% cocoa content, so 1 kg chocolate ≈ 0.4 kg cocoa
    // Checking against raw cocoa input (producer declares cocoa sourced, not finished product)
    min: 200,
    max: 700,
    source: "FAO GAEZ São Tomé cocoa yield data",
    notes: "Dry cocoa bean yield. For finished Modica chocolate, divide by ~0.4 conversion factor.",
  },
  yubari: {
    // Yubari King: ~8,000-10,000 plants/ha, each plant 1-2 melons ~2 kg each
    // Total: 16,000-40,000 kg/ha but commercial yield is much lower
    // Licensed growers average ~15,000-25,000 kg/ha at commercial scale
    min: 5000,
    max: 30000,
    source: "Hokkaido Agricultural Statistics 2022 — Yubari melon",
    notes: "Greenhouse crop. High yield per ha but strict grading means only 30-40% is premium grade.",
  },
};

// Shoelace formula: polygon area in m² from [lon, lat] coordinates
// Uses approximate conversion: 1° lat ≈ 111,320 m; 1° lon ≈ 111,320 * cos(lat) m
function polygonAreaM2(coords: [number, number][]): number {
  const n = coords.length;
  if (n < 3) return 0;

  // Average latitude for longitude scaling
  const avgLat = coords.reduce((s, c) => s + c[1], 0) / n * Math.PI / 180;
  const latScale = 111320;         // m per degree latitude
  const lonScale = 111320 * Math.cos(avgLat); // m per degree longitude at avgLat

  // Convert to metres
  const pts = coords.map(([lon, lat]) => [lon * lonScale, lat * latScale]);

  // Shoelace
  let area = 0;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    area += pts[j][0] * pts[i][1];
    area -= pts[i][0] * pts[j][1];
  }
  return Math.abs(area / 2);
}

export function checkPlausibility(
  plotPolygon: { type: string; coordinates: [number, number][][] },
  skin: string,
  claimedKg: number | null | undefined,
): PlausibilityResult {
  const benchmark = YIELD_BENCHMARKS[skin] ?? { min: 0, max: Infinity, source: "N/A", notes: "" };

  // Calculate area from outer ring
  const outerRing = plotPolygon.coordinates[0];
  const areaM2 = polygonAreaM2(outerRing);
  const plotAreaHa = parseFloat((areaM2 / 10000).toFixed(4));
  const maxRealisticKg = Math.round(plotAreaHa * benchmark.max);
  const minRealisticKg = Math.round(plotAreaHa * benchmark.min);
  const yieldKgPerHa = claimedKg && plotAreaHa > 0 ? parseFloat((claimedKg / plotAreaHa).toFixed(1)) : 0;

  const flags: string[] = [];
  let plausible = true;

  if (plotAreaHa < 0.01) {
    flags.push("Plot area too small (< 0.01 ha) — coordinates may be incorrect");
    plausible = false;
  }

  if (plotAreaHa > 500) {
    flags.push(`Plot area unusually large (${plotAreaHa.toFixed(1)} ha) — verify coordinates`);
  }

  if (claimedKg !== null && claimedKg !== undefined && claimedKg > 0) {
    if (claimedKg > maxRealisticKg) {
      flags.push(
        `Claimed ${claimedKg.toLocaleString()} kg exceeds max realistic yield of ${maxRealisticKg.toLocaleString()} kg for ${plotAreaHa.toFixed(2)} ha`
      );
      plausible = false;
    }
    if (claimedKg < minRealisticKg * 0.1 && plotAreaHa > 0.1) {
      // Very low claim could indicate under-declaration (tax fraud) — flag but don't reject
      flags.push(
        `Claimed yield (${claimedKg.toLocaleString()} kg) is unusually low for ${plotAreaHa.toFixed(2)} ha — verify`
      );
    }
  }

  return {
    plausible,
    claimedKg: claimedKg ?? 0,
    plotAreaHa,
    maxRealisticKg,
    yieldKgPerHa,
    benchmarkKgPerHa: { min: benchmark.min, max: benchmark.max },
    benchmarkSource: benchmark.source,
    flags,
  };
}
