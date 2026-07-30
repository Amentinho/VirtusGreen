/**
 * Ingest AdE INSPIRE GML cadastral files into catasto_parcels table.
 *
 * HOW TO GET THE FILES
 * --------------------
 * 1. Go to: https://www.agenziaentrate.gov.it/portale/schede/fabbricatieTerreni/
 *           consultazione-cartografia-catastale/cartografia-catastale
 * 2. Download → Regione: Sicilia → Provincia → Comune
 * 3. Unzip. Each comune folder contains two GML files:
 *      B202_BRONTE_map.gml  ← cadastral zones (IGNORE this one)
 *      B202_BRONTE_ple.gml  ← individual parcels (USE this one)
 *
 * USAGE
 * -----
 *   # Single comune:
 *   npx tsx scripts/ingest-catasto.ts ~/Downloads/SICILIA/CT/B202_BRONTE/B202_BRONTE_ple.gml
 *
 *   # Whole province at once:
 *   find ~/Downloads/SICILIA/CT -name "*_ple.gml" | \
 *     xargs -I{} npx tsx scripts/ingest-catasto.ts {}
 *
 * REFERENCE FORMAT (decoded)
 * --------------------------
 * NATIONALCADASTRALREFERENCE = "B202_FFFFSSS.PPPP"
 *   B202     = codice catastale del comune (stored as comuneCodice)
 *   FFFF     = foglio, zero-padded 4 digits (e.g. "0001", "0082")
 *   SSS      = sezione, 2 chars ("00" for rural, "A0"/"B0" for urban sections)
 *   .PPPP    = particella (mappale), variable digits after the dot
 *
 * Coordinates are in EPSG:6706 (RDN2008 ≈ WGS84), stored as "lat lon lat lon ..."
 * GeoJSON requires [lon, lat] pairs → we swap during ingestion.
 *
 * The script is idempotent: re-running for the same comune replaces all rows.
 */

import "dotenv/config";
import { XMLParser } from "fast-xml-parser";
import { readFileSync } from "fs";
import { basename, resolve } from "path";
import { Pool } from "@neondatabase/serverless";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// ── Parse a NATIONALCADASTRALREFERENCE into its components ───────────────────
// Old format: "B202_000100.1"  → CODICE_FFFFSSS.PPPP (foglio then sezione)
// New format: "I314A002500.1"  → CODICESFFFFSSC.PPPP (sezione(1) + foglio(4) + subcode(2))
function parseRef(ref: string): { comuneCodice: string; foglio: string; sezione: string; mappale: string } | null {
  // Old format with underscore: CODICE_FOGLIO(4)SEZIONE(2).PARTICELLA
  const old = ref.match(/^([A-Z]\d{3})_([0-9]{4})([A-Z0-9]{2})\.(\d+)$/i);
  if (old) {
    return {
      comuneCodice: old[1].toUpperCase(),
      foglio:       old[2],
      sezione:      old[3],
      mappale:      old[4],
    };
  }
  // New format without underscore: CODICE + SEZIONE(1 letter) + FOGLIO(4 digits) + SUBCODE(2) + . + PARTICELLA
  const neo = ref.match(/^([A-Z]\d{3})([A-Z])(\d{4})\d{2}\.(\d+)$/i);
  if (neo) {
    return {
      comuneCodice: neo[1].toUpperCase(),
      foglio:       neo[3],           // 4-digit foglio
      sezione:      neo[2] + "0",     // normalize to 2-char sezione (e.g. "A" → "A0")
      mappale:      neo[4],
    };
  }
  return null;
}

// ── Parse gml:posList "lat lon lat lon ..." → GeoJSON ring [[lon,lat],...] ───
// fast-xml-parser returns an object {#text, @_srsDimension} when the tag has attrs
function posListToRing(posList: any): [number, number][] {
  const raw: string = typeof posList === "object" ? (posList["#text"] ?? "") : String(posList);
  const nums = raw.trim().split(/\s+/).map(Number);
  const ring: [number, number][] = [];
  for (let i = 0; i < nums.length - 1; i += 2) {
    const lat = nums[i];
    const lon = nums[i + 1];
    ring.push([lon, lat]); // GeoJSON is [lon, lat]
  }
  return ring;
}

// ── Compute approximate area in m² from a WGS84 polygon ─────────────────────
// Shoelace formula on lat/lon, converted to m² using local scale factor
function areaFromGeoJsonRing(ring: [number, number][]): number {
  const R = 6378137; // Earth radius in metres
  const DEG = Math.PI / 180;
  let area = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x1, y1] = [ring[i][0] * DEG, ring[i][1] * DEG];
    const [x2, y2] = [ring[j][0] * DEG, ring[j][1] * DEG];
    area += (x1 - x2) * (2 + Math.sin(y1) + Math.sin(y2));
  }
  return Math.abs(area * R * R / 2);
}

async function main() {
  const gmlPath = process.argv[2];
  if (!gmlPath) {
    console.error("Usage: npx tsx scripts/ingest-catasto.ts <path/to/COMUNE_ple.gml>");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL env var is required");
    process.exit(1);
  }

  const absPath = resolve(gmlPath);
  console.log(`\nReading: ${absPath}`);

  const xml = readFileSync(absPath, "utf-8");

  // Extract comune code from filename: "B202_BRONTE_ple.gml" → "B202"
  const filenameCode = basename(absPath).match(/^([A-Z]\d{3})/i)?.[1]?.toUpperCase();

  console.log("Parsing GML…");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseTagValue: false,
    isArray: (name) => name === "wfs:member",
  });
  const doc = parser.parse(xml);

  const members: any[] = doc?.["wfs:FeatureCollection"]?.["wfs:member"] ?? [];
  console.log(`Found ${members.length} members`);

  // ── Connect to DB ────────────────────────────────────────────────────────
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS catasto_parcels (
      id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      comune_codice TEXT NOT NULL,
      foglio     TEXT NOT NULL,
      sezione    TEXT NOT NULL DEFAULT '00',
      mappale    TEXT NOT NULL,
      area_sqm   INTEGER,
      geometry   JSONB NOT NULL,
      ingested_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS catasto_lookup_idx
      ON catasto_parcels (comune_codice, foglio, mappale);
    CREATE INDEX IF NOT EXISTS catasto_comune_idx
      ON catasto_parcels (comune_codice);
    ALTER TABLE catasto_parcels ADD COLUMN IF NOT EXISTS sezione TEXT NOT NULL DEFAULT '00';
  `);

  // Delete existing rows for this comune
  const comuneToDelete = filenameCode ?? null;
  if (comuneToDelete) {
    const deleted = await pool.query(
      "DELETE FROM catasto_parcels WHERE comune_codice = $1",
      [comuneToDelete]
    );
    console.log(`Cleared ${deleted.rowCount} existing rows for ${comuneToDelete}`);
  }

  let inserted = 0;
  let skipped  = 0;
  const BATCH = 500;
  const rows: any[] = [];

  const flush = async () => {
    if (rows.length === 0) return;
    const placeholders = rows.map((_, i) => {
      const b = i * 6;
      return `($${b+1},$${b+2},$${b+3},$${b+4},$${b+5},$${b+6})`;
    }).join(",");
    const values = rows.flatMap(r => [r.comuneCodice, r.foglio, r.sezione, r.mappale, r.areaSqm, JSON.stringify(r.geometry)]);
    await pool.query(
      `INSERT INTO catasto_parcels (comune_codice,foglio,sezione,mappale,area_sqm,geometry)
       VALUES ${placeholders}
       ON CONFLICT DO NOTHING`,
      values
    );
    inserted += rows.length;
    rows.length = 0;
    process.stdout.write(`\r  Inserted ${inserted} parcels…`);
  };

  for (const member of members) {
    const parcel = member?.["CP:CadastralParcel"];
    if (!parcel) { skipped++; continue; }

    const refRaw: string = parcel?.["CP:NATIONALCADASTRALREFERENCE"] ?? "";
    const ref = parseRef(refRaw);
    if (!ref) { skipped++; continue; }

    // Extract polygon coordinates from gml:posList
    // Geometry can be Polygon or MultiSurface with nested Polygon
    let posListStr: string | null = null;

    const geomNode = parcel?.["CP:msGeometry"];
    if (geomNode) {
      const poly = geomNode?.["gml:Polygon"] ?? geomNode?.["gml:MultiSurface"]?.["gml:surfaceMember"]?.["gml:Polygon"];
      posListStr = poly?.["gml:exterior"]?.["gml:LinearRing"]?.["gml:posList"] ?? null;
    }

    if (!posListStr) { skipped++; continue; }

    const ring = posListToRing(posListStr);
    if (ring.length < 3) { skipped++; continue; }

    // Close ring if not already closed
    if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
      ring.push(ring[0]);
    }

    const geometry = { type: "Polygon", coordinates: [ring] };
    const areaSqm = Math.round(areaFromGeoJsonRing(ring));

    rows.push({ ...ref, areaSqm, geometry });
    if (rows.length >= BATCH) await flush();
  }
  await flush();

  console.log(`\n✅ Done. Inserted ${inserted} parcels. Skipped ${skipped} invalid.`);
  console.log(`   Comune: ${filenameCode ?? "unknown"}`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
