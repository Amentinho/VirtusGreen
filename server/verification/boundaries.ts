/**
 * Layer 2 — GI Zone Boundary Check
 *
 * Verifies that a registered plot polygon centroid falls within the
 * official geographic boundary of the claimed GI product zone.
 *
 * Boundaries are derived from the official EU/MIPAAF product specifications
 * (disciplinari di produzione) and municipal boundaries. Production should
 * replace these with the authoritative SIAN/MIPAAF cadastral GeoJSON.
 */

export interface ZoneCheckResult {
  insideZone: boolean;
  zoneName: string;
  skinLabel: string;
  authority: string;    // regulation reference
  centroid: [number, number]; // [lon, lat]
  distanceKm: number | null; // null if inside, km to nearest boundary if outside
}

type Ring = [number, number][]; // [lon, lat] pairs

// ── Official GI zone boundary polygons ────────────────────────────────────────
// Coordinates: [longitude, latitude]

const GI_ZONES: Record<string, {
  label: string;
  authority: string;
  rings: Ring[];          // multiple rings = multipolygon (simplified)
}> = {
  bronte: {
    label: "Bronte DOP Pistachio Zone",
    authority: "DOP reg. CE 1107/96 – Comune di Bronte (CT)",
    rings: [[
      // Comune di Bronte municipal boundary (simplified — 8 vertices)
      [14.7800, 37.7500],
      [14.9100, 37.7500],
      [14.9100, 37.8300],
      [14.8600, 37.8500],
      [14.8000, 37.8400],
      [14.7600, 37.8000],
      [14.7600, 37.7700],
      [14.7800, 37.7500],
    ]],
  },
  etna: {
    label: "Etna DOC Wine Zone",
    authority: "DOC DM 11/08/2011 – Comuni pedemontani Etna (CT)",
    rings: [[
      // Etna DOC covers municipalities on all slopes of Etna up to ~1000m
      [14.8500, 37.6000],
      [15.1500, 37.6000],
      [15.2000, 37.7500],
      [15.1500, 37.9800],
      [14.9500, 38.0200],
      [14.7500, 37.9500],
      [14.7000, 37.8000],
      [14.7500, 37.6800],
      [14.8500, 37.6000],
    ]],
  },
  modica: {
    // For Modica IGP: production zone = Comune di Modica (RG), SE Sicily
    // The cocoa ORIGIN is São Tomé — verified separately by EUDR
    label: "Modica IGP Chocolate Production Zone",
    authority: "IGP reg. UE 2018/1476 – Comune di Modica (RG)",
    rings: [[
      [14.6800, 36.7800],
      [14.8200, 36.7800],
      [14.8200, 36.9000],
      [14.7500, 36.9200],
      [14.6600, 36.8800],
      [14.6500, 36.8200],
      [14.6800, 36.7800],
    ]],
  },
  yubari: {
    label: "Yubari King Melon GI Zone",
    authority: "Japan GI Act – Yubari City, Hokkaido (MAFF 2015)",
    rings: [[
      [141.8800, 43.0000],
      [142.0500, 43.0000],
      [142.0800, 43.0800],
      [142.0200, 43.1500],
      [141.9000, 43.1500],
      [141.8500, 43.0800],
      [141.8800, 43.0000],
    ]],
  },
};

// ── Geometry helpers ──────────────────────────────────────────────────────────

function centroidOfPolygon(coords: [number, number][]): [number, number] {
  const n = coords.length;
  let sumLon = 0, sumLat = 0;
  for (const [lon, lat] of coords) { sumLon += lon; sumLat += lat; }
  return [sumLon / n, sumLat / n];
}

// Ray-casting point-in-polygon
function pointInRing(point: [number, number], ring: Ring): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

// Haversine distance between two [lon, lat] points in km
function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = (b[1] - a[1]) * Math.PI / 180;
  const dLon = (b[0] - a[0]) * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * Math.PI / 180) * Math.cos(b[1] * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// Nearest distance from point to any vertex of all zone rings (approximate)
function distanceToZoneKm(point: [number, number], rings: Ring[]): number {
  let min = Infinity;
  for (const ring of rings) {
    for (const vertex of ring) {
      const d = haversineKm(point, vertex);
      if (d < min) min = d;
    }
  }
  return parseFloat(min.toFixed(2));
}

// ── Public API ────────────────────────────────────────────────────────────────

export function checkZoneBoundary(
  plotPolygon: { type: string; coordinates: [number, number][][] },
  skin: string,
): ZoneCheckResult {
  const zone = GI_ZONES[skin];
  if (!zone) {
    return {
      insideZone: false,
      zoneName: "Unknown",
      skinLabel: skin,
      authority: "N/A",
      centroid: [0, 0],
      distanceKm: null,
    };
  }

  // Use outer ring of plot polygon, compute centroid
  const plotRing = plotPolygon.coordinates[0];
  const centroid = centroidOfPolygon(plotRing);

  // Check centroid against each zone ring
  const insideZone = zone.rings.some(ring => pointInRing(centroid, ring));
  const distanceKm = insideZone ? 0 : distanceToZoneKm(centroid, zone.rings);

  return {
    insideZone,
    zoneName: zone.label,
    skinLabel: skin,
    authority: zone.authority,
    centroid,
    distanceKm: insideZone ? null : distanceKm,
  };
}
