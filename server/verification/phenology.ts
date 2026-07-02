/**
 * Layer 1 — Crop Phenology Check
 *
 * Each GI crop has a known seasonal NDVI signature (phenological calendar).
 * We query 12 months of Sentinel-2 data and compare the actual curve
 * against the expected profile for that crop type.
 *
 * This catches:
 *  - Off-year pistachio claims (biennial crop — NDVI is lower in off-years)
 *  - Wrong crop in zone (forest vs vineyard vs pistachio)
 *  - Abandoned/unproductive plots
 */

export interface PhenologyResult {
  score: number;              // 0-100: how well the NDVI curve matches expected
  cropMatch: boolean;         // score >= 60
  profile: string;            // crop profile name
  monthlyExpected: Record<string, { min: number; max: number }>;
  monthlyActual: Record<string, number>;
  mismatches: string[];       // months that fell outside expected range
  notes: string;
}

// Monthly NDVI expected ranges [min, max] per crop
// Month keys: "01" = Jan ... "12" = Dec
// Based on published phenological calendars for each crop/region

const PHENOLOGY_PROFILES: Record<string, {
  label: string;
  monthly: Record<string, [number, number]>;
  notes: string;
}> = {
  bronte: {
    // Pistachio (Pistacia vera) — deciduous, NW Etna slope, 600-900m
    // Biennial bearer: on-years show higher summer NDVI than off-years
    // Sentinel-2 studies on Sicilian pistachios show clear seasonal pattern
    label: "Pistachio — Mediterranean deciduous",
    notes: "Biennial crop. On-years peak NDVI 0.45-0.65 in July. Off-years peak 0.25-0.40.",
    monthly: {
      "01": [0.03, 0.18], // dormant
      "02": [0.03, 0.18], // dormant
      "03": [0.08, 0.28], // bud burst
      "04": [0.20, 0.45], // spring flush
      "05": [0.30, 0.60], // full canopy
      "06": [0.35, 0.65], // summer peak / nut development
      "07": [0.35, 0.65], // peak
      "08": [0.30, 0.60], // pre-harvest
      "09": [0.20, 0.50], // harvest window (Sept–Oct)
      "10": [0.15, 0.40], // post-harvest leaf colour change
      "11": [0.08, 0.25], // senescence
      "12": [0.03, 0.18], // dormant
    },
  },
  etna: {
    // Vitis vinifera — deciduous vineyard, Etna DOC, 400-900m
    label: "Grapevine — Mediterranean deciduous vineyard",
    notes: "Etna DOC harvest: Aug-Oct. Max NDVI 0.5-0.7 in Jun-Jul. Full dormancy Dec-Feb.",
    monthly: {
      "01": [0.03, 0.15],
      "02": [0.03, 0.15],
      "03": [0.05, 0.20], // bud burst (late March Etna altitude)
      "04": [0.15, 0.40],
      "05": [0.30, 0.60],
      "06": [0.40, 0.72], // peak vegetative
      "07": [0.40, 0.72],
      "08": [0.35, 0.65], // véraison
      "09": [0.25, 0.55], // harvest
      "10": [0.15, 0.40], // post-harvest senescence
      "11": [0.05, 0.22],
      "12": [0.03, 0.15],
    },
  },
  modica: {
    // Theobroma cacao — tropical evergreen, São Tomé island (equatorial)
    // High stable NDVI year-round with minor wet/dry season variation
    label: "Cocoa — tropical evergreen (São Tomé)",
    notes: "Equatorial crop. Stable NDVI 0.45-0.80. Slight dip in Jul-Aug dry season.",
    monthly: {
      "01": [0.45, 0.80],
      "02": [0.45, 0.80],
      "03": [0.45, 0.80],
      "04": [0.45, 0.80],
      "05": [0.45, 0.80],
      "06": [0.40, 0.75],
      "07": [0.35, 0.70], // minor dry season dip
      "08": [0.35, 0.70],
      "09": [0.45, 0.80],
      "10": [0.50, 0.82],
      "11": [0.50, 0.82],
      "12": [0.45, 0.80],
    },
  },
  yubari: {
    // Cucumis melo (Yubari King melon) — annual crop, greenhouse, Hokkaido
    // Very short growing window May-Aug. Outside that: bare soil/snow
    label: "Yubari King Melon — annual greenhouse (Hokkaido)",
    notes: "Short season crop. Active NDVI only May-Aug. Low values outside season.",
    monthly: {
      "01": [0.02, 0.10], // snow-covered / bare
      "02": [0.02, 0.10],
      "03": [0.02, 0.12],
      "04": [0.05, 0.20], // greenhouse startup
      "05": [0.20, 0.55], // planting / early growth
      "06": [0.35, 0.70], // peak growth
      "07": [0.35, 0.70], // fruit set
      "08": [0.20, 0.55], // harvest
      "09": [0.05, 0.20], // end of season
      "10": [0.02, 0.12],
      "11": [0.02, 0.10],
      "12": [0.02, 0.10],
    },
  },
};

export function scorePhenology(
  skin: string,
  monthlyNdvi: Record<string, number>, // e.g. { "2025-09": 0.42, "2025-10": 0.31 }
): PhenologyResult {
  const profile = PHENOLOGY_PROFILES[skin];
  if (!profile) {
    return {
      score: 0, cropMatch: false, profile: "unknown",
      monthlyExpected: {}, monthlyActual: monthlyNdvi,
      mismatches: [], notes: "No phenology profile for this skin",
    };
  }

  const mismatches: string[] = [];
  let matched = 0;
  let total = 0;

  const monthlyExpected: Record<string, { min: number; max: number }> = {};
  for (const [mm, [min, max]] of Object.entries(profile.monthly)) {
    monthlyExpected[mm] = { min, max };
  }

  // For each month we have actual data, check against expected range
  for (const [period, ndvi] of Object.entries(monthlyNdvi)) {
    const mm = period.slice(5, 7); // "2025-09" → "09"
    const expected = profile.monthly[mm];
    if (!expected) continue;
    total++;
    if (ndvi >= expected[0] && ndvi <= expected[1]) {
      matched++;
    } else {
      mismatches.push(`${period}: ${ndvi.toFixed(3)} (expected ${expected[0]}–${expected[1]})`);
    }
  }

  const score = total === 0 ? 0 : Math.round((matched / total) * 100);
  const cropMatch = score >= 60;

  return {
    score,
    cropMatch,
    profile: profile.label,
    monthlyExpected,
    monthlyActual: monthlyNdvi,
    mismatches,
    notes: profile.notes,
  };
}
