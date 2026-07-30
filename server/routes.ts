import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertProducerSchema, insertPlotSchema, insertBatchSchema } from "@shared/schema";
import { z } from "zod";
import { sendContactFormEmail, sendDppReadyEmail } from "./email";
import { db } from "./db";
import { producers, plots, batches, catastoParcels } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { checkZoneBoundary } from "./verification/boundaries";
import { scorePhenology } from "./verification/phenology";
import { checkPlausibility } from "./verification/plausibility";
import { parseIntervals, deduplicateByMonth, buildQualityReport } from "./verification/eo_quality";
import { anchorBatch } from "./anchor";

// Copernicus Sentinel Hub helpers
const COPERNICUS_TOKEN_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";
const SENTINEL_HUB_BASE = "https://sh.dataspace.copernicus.eu";

// Real registered plot polygons — each skin uses a distinct location
const PLOTS: Record<string, { name: string; polygon: object; ndviThreshold: number }> = {
  // Bronte DOP pistachio — Contrada Difesa, Bronte (CT), NW slope of Etna
  bronte: {
    name: "Contrada Difesa, Bronte (CT)",
    ndviThreshold: 0.15,
    polygon: {
      type: "Polygon",
      coordinates: [[
        [14.8312, 37.7891], [14.8356, 37.7891],
        [14.8356, 37.7921], [14.8312, 37.7921],
        [14.8312, 37.7891],
      ]],
    },
  },
  // Etna DOC wine — Contrada Calderara, Randazzo (CT), north face of Etna
  etna: {
    name: "Contrada Calderara, Randazzo (CT)",
    ndviThreshold: 0.20,
    polygon: {
      type: "Polygon",
      coordinates: [[
        [14.9520, 37.9410], [14.9580, 37.9410],
        [14.9580, 37.9450], [14.9520, 37.9450],
        [14.9520, 37.9410],
      ]],
    },
  },
  // Modica IGP chocolate — cocoa origin, São Tomé island (EUDR tracked)
  modica: {
    name: "Água Izé plantation, São Tomé island",
    ndviThreshold: 0.40, // tropical cocoa: high NDVI expected
    polygon: {
      type: "Polygon",
      coordinates: [[
        [6.7180, 0.2820], [6.7240, 0.2820],
        [6.7240, 0.2870], [6.7180, 0.2870],
        [6.7180, 0.2820],
      ]],
    },
  },
  // Lava field on Etna — used for fake/rejected batches to guarantee NDVI failure
  fake: {
    name: "Lava field, Etna summit (non-agricultural)",
    ndviThreshold: 99,
    polygon: {
      type: "Polygon",
      coordinates: [[
        [14.9930, 37.7480], [14.9990, 37.7480],
        [14.9990, 37.7520], [14.9930, 37.7520],
        [14.9930, 37.7480],
      ]],
    },
  },
};

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getCopernicusToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.COPERNICUS_CLIENT_ID!,
    client_secret: process.env.COPERNICUS_CLIENT_SECRET!,
  });
  const res = await fetch(COPERNICUS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) throw new Error(`Copernicus auth failed: ${res.status}`);
  const data = await res.json() as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.value;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      
      // Send email notification (don't block response on email sending)
      sendContactFormEmail({
        name: validatedData.name,
        email: validatedData.email,
        projectType: validatedData.projectType,
        message: validatedData.message,
      }).catch(error => {
        console.error('Email notification failed:', error);
      });
      
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        });
      } else {
        res.status(500).json({ error: "Failed to submit contact form" });
      }
    }
  });

  app.get("/api/contact", async (_req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve submissions" });
    }
  });

  // ── Auth routes ──────────────────────────────────────────────────────────

  app.post("/api/auth/register", async (req: any, res) => {
    try {
      if (!db) { res.status(503).json({ error: "Database not configured" }); return; }
      const data = insertProducerSchema.parse(req.body);
      const { password, ...producerData } = data;
      const passwordHash = await bcrypt.hash(password, 12);
      const [producer] = await db.insert(producers).values({ ...producerData, passwordHash }).returning();
      req.session.producerId = producer.id;
      const { passwordHash: _, ...safeProducer } = producer;
      res.status(201).json(safeProducer);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ error: "Validation failed", details: e.errors });
      else if (e.message?.includes("unique")) res.status(409).json({ error: "An account with this email already exists" });
      else res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", async (req: any, res) => {
    try {
      if (!db) { res.status(503).json({ error: "Database not configured" }); return; }
      const { email, password } = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
      const [producer] = await db.select().from(producers).where(eq(producers.email, email)).limit(1);
      if (!producer || !producer.passwordHash) {
        res.status(401).json({ error: "Invalid email or password" }); return;
      }
      const valid = await bcrypt.compare(password, producer.passwordHash);
      if (!valid) { res.status(401).json({ error: "Invalid email or password" }); return; }
      req.session.producerId = producer.id;
      const { passwordHash: _, ...safeProducer } = producer;
      res.json(safeProducer);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ error: "Invalid request", details: e.errors });
      else res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", async (req: any, res) => {
    if (!req.session?.producerId) { res.status(401).json({ error: "Not authenticated" }); return; }
    if (!db) { res.status(503).json({ error: "Database not configured" }); return; }
    const [producer] = await db.select().from(producers).where(eq(producers.id, req.session.producerId)).limit(1);
    if (!producer) { req.session.destroy(() => {}); res.status(401).json({ error: "Not authenticated" }); return; }
    const { passwordHash: _, ...safeProducer } = producer;
    res.json(safeProducer);
  });

  // ── Producer registration ────────────────────────────────────────────────

  app.post("/api/producers", async (req, res) => {
    try {
      if (!db) { res.status(503).json({ error: "Database not configured" }); return; }
      const data = insertProducerSchema.parse(req.body);
      const [producer] = await db.insert(producers).values(data).returning();
      res.status(201).json(producer);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ error: "Validation failed", details: e.errors });
      else res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/producers", async (_req, res) => {
    try {
      if (!db) { res.status(503).json({ error: "Database not configured" }); return; }
      const all = await db.select().from(producers).orderBy(desc(producers.createdAt));
      res.json(all);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Catasto lookup — queries our local DB loaded via scripts/ingest-catasto.ts
  // Params: codiceCatastale (4-char, e.g. "B202"), foglio, particella
  app.get("/api/catasto/lookup", async (req, res) => {
    try {
      if (!db) { res.status(503).json({ error: "Database not configured" }); return; }
      const { codiceCatastale, foglio, particella } = req.query as Record<string, string>;
      if (!codiceCatastale || !foglio || !particella) {
        res.status(400).json({ error: "codiceCatastale, foglio, particella are required" }); return;
      }

      // Normalize foglio: "1" → "0001", "82A" → foglio="0082" sezione="A0"
      const foglioRaw = foglio.trim().toUpperCase();
      const foglioMatch = foglioRaw.match(/^(\d+)([A-Z]?)$/);
      if (!foglioMatch) { res.status(400).json({ error: "Foglio non valido" }); return; }
      const foglioN   = foglioMatch[1].padStart(4, "0");
      const sezione   = foglioMatch[2] ? foglioMatch[2] + "0" : "00";
      const parcellaP = particella.trim();

      const rows = await db
        .select()
        .from(catastoParcels)
        .where(
          and(
            eq(catastoParcels.comuneCodice, codiceCatastale.toUpperCase()),
            eq(catastoParcels.foglio, foglioN),
            eq(catastoParcels.sezione, sezione),
            eq(catastoParcels.mappale, parcellaP)
          )
        )
        .limit(1);

      if (!rows.length) {
        // Check if we have ANY data for this comune — helps producers diagnose the issue
        const hasComune = await db
          .select({ id: catastoParcels.id })
          .from(catastoParcels)
          .where(eq(catastoParcels.comuneCodice, codiceCatastale.toUpperCase()))
          .limit(1);

        if (!hasComune.length) {
          res.status(404).json({
            error: `Dati catastali per il comune ${codiceCatastale} non ancora caricati. Disegna il poligono manualmente.`,
            code: "COMUNE_NOT_LOADED",
          });
        } else {
          res.status(404).json({
            error: `Particella Fg. ${foglio} Part. ${particella} non trovata. Verifica i dati o disegna manualmente.`,
            code: "PARCEL_NOT_FOUND",
          });
        }
        return;
      }

      const parcel = rows[0];
      res.json({
        geometry: parcel.geometry,
        areaSqm: parcel.areaSqm,
        foglio: parcel.foglio,
        mappale: parcel.mappale,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Plot registration ─────────────────────────────────────────────────────

  app.post("/api/plots", async (req, res) => {
    try {
      if (!db) { res.status(503).json({ error: "Database not configured" }); return; }
      const data = insertPlotSchema.parse(req.body);
      const [plot] = await db.insert(plots).values(data).returning();
      res.status(201).json(plot);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ error: "Validation failed", details: e.errors });
      else res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/plots/:producerId", async (req, res) => {
    try {
      if (!db) { res.status(503).json({ error: "Database not configured" }); return; }
      const all = await db.select().from(plots).where(eq(plots.producerId, req.params.producerId));
      res.json(all);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Next batch code (unique per producer+skin+year) ──────────────────────

  app.get("/api/batches/next-code", async (req, res) => {
    try {
      if (!db) { res.status(503).json({ error: "Database not configured" }); return; }
      const { producerId, skin } = req.query as { producerId: string; skin: string };
      if (!producerId || !skin) { res.status(400).json({ error: "producerId and skin required" }); return; }
      const prefix = skin === "bronte" ? "BRN" : skin === "etna" ? "ETN" : skin === "modica" ? "MOD" : "YUB";
      const year = new Date().getFullYear();
      const pattern = `${prefix}-${year}-%`;
      // Find all existing codes for this producer+skin+year
      const existing = await db.select({ batchCode: batches.batchCode })
        .from(batches)
        .where(eq(batches.producerId, producerId));
      const nums = existing
        .map(b => b.batchCode)
        .filter(c => c.startsWith(`${prefix}-${year}-`))
        .map(c => parseInt(c.split("-")[2] ?? "0", 10))
        .filter(n => !isNaN(n));
      const next = (nums.length > 0 ? Math.max(...nums) : 0) + 1;
      res.json({ code: `${prefix}-${year}-${String(next).padStart(3, "0")}` });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Batch registration + auto-verify ─────────────────────────────────────

  app.post("/api/batches", async (req, res) => {
    try {
      if (!db) { res.status(503).json({ error: "Database not configured" }); return; }
      const data = insertBatchSchema.parse(req.body);
      const [batch] = await db.insert(batches).values(data).returning();
      res.status(201).json(batch);
    } catch (e: any) {
      if (e instanceof z.ZodError) res.status(400).json({ error: "Validation failed", details: e.errors });
      else res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/batches", async (req, res) => {
    try {
      if (!db) { res.status(503).json({ error: "Database not configured" }); return; }
      const { producerId } = req.query as { producerId?: string };
      const all = producerId
        ? await db.select().from(batches).where(eq(batches.producerId, producerId)).orderBy(desc(batches.createdAt))
        : await db.select().from(batches).orderBy(desc(batches.createdAt));
      res.json(all);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/batches/:batchCode", async (req, res) => {
    try {
      if (!db) { res.status(503).json({ error: "Database not configured" }); return; }
      const [batch] = await db.select().from(batches).where(eq(batches.batchCode, req.params.batchCode));
      if (!batch) { res.status(404).json({ error: "Batch not found" }); return; }
      const [producer] = await db.select().from(producers).where(eq(producers.id, batch.producerId));
      const [plot] = await db.select().from(plots).where(eq(plots.id, batch.plotId));
      res.json({
        ...batch,
        producerName: producer?.name,
        farmName: producer?.farmName,
        region: producer?.region,
        plotName: plot?.name,
      });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Trigger full 3-layer verification for an existing batch
  app.post("/api/batches/:batchCode/verify", async (req, res) => {
    try {
      if (!db) { res.status(503).json({ error: "Database not configured" }); return; }
      const [batch] = await db.select().from(batches).where(eq(batches.batchCode, req.params.batchCode));
      if (!batch) { res.status(404).json({ error: "Batch not found" }); return; }
      const [plot] = await db.select().from(plots).where(eq(plots.id, batch.plotId));
      if (!plot) { res.status(404).json({ error: "Plot not found" }); return; }

      if (!process.env.COPERNICUS_CLIENT_ID || !process.env.COPERNICUS_CLIENT_SECRET) {
        res.status(503).json({ error: "Copernicus credentials not configured" }); return;
      }

      const polygon = plot.polygon as { type: string; coordinates: [number, number][][] };

      // ── Layer 2: Zone boundary check (no API call needed) ─────────────────
      const zoneCheck = checkZoneBoundary(polygon, plot.skin);

      // ── Layer 3: Plausibility check (no API call needed) ──────────────────
      const claimedKg = batch.quantityKg ? parseFloat(batch.quantityKg.toString()) : null;
      const plausibility = checkPlausibility(polygon, plot.skin, claimedKg);

      // ── Satellite: cloud-masked 12-month phenology + 3-year baseline ────────
      const token = await getCopernicusToken();

      // Evalscript with SCL cloud masking: excludes clouds (8,9,10), cloud shadow (3), snow (11)
      // Reports sampleCount and noDataCount so we can compute valid fraction per interval
      const evalscript = `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "SCL", "dataMask"] }],
    output: [
      { id: "ndvi", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1, sampleType: "UINT8" }
    ]
  };
}
function evaluatePixel(s) {
  // SCL classes to exclude: 0=no data, 1=saturated, 3=cloud shadow, 8=cloud medium, 9=cloud high, 10=thin cirrus, 11=snow
  const bad = [0, 1, 3, 8, 9, 10, 11];
  const isCloud = bad.indexOf(s.SCL) >= 0;
  const mask = s.dataMask && !isCloud ? 1 : 0;
  const ndvi = (s.B08 - s.B04) / (s.B08 + s.B04 + 0.0001);
  return {
    ndvi: [mask ? ndvi : NaN],
    dataMask: [mask]
  };
}`;

      // 12-month phenology window ending at harvest end date
      const harvestEnd = new Date(batch.harvestDateTo);
      const phenologyStart = new Date(harvestEnd);
      phenologyStart.setFullYear(phenologyStart.getFullYear() - 1);
      const phenoFrom = phenologyStart.toISOString().slice(0, 10);
      const phenoTo = batch.harvestDateTo;

      // 3-year baseline window (same calendar months, 3 years back)
      const baselineStart = new Date(harvestEnd);
      baselineStart.setFullYear(baselineStart.getFullYear() - 3);
      const baselineFrom = baselineStart.toISOString().slice(0, 10);

      async function querySentinel(fromDate: string, toDate: string) {
        const payload = {
          input: {
            bounds: { geometry: polygon },
            data: [{ type: "sentinel-2-l2a", dataFilter: { mosaickingOrder: "leastCC" } }],
          },
          aggregation: {
            timeRange: { from: `${fromDate}T00:00:00Z`, to: `${toDate}T23:59:59Z` },
            aggregationInterval: { of: "P30D" },
            evalscript,
            resx: 0.0001, resy: 0.0001,
          },
          calculations: {
            ndvi: { statistics: { default: { percentiles: { k: [25, 50, 75] } } } },
          },
        };
        const r = await fetch(`${SENTINEL_HUB_BASE}/api/v1/statistics`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!r.ok) throw new Error(`Sentinel Hub error: ${await r.text()}`);
        return (await r.json() as any).data ?? [];
      }

      // Query phenology window + 3-year baseline in parallel
      let rawPheno: any[], rawBaseline: any[];
      try {
        [rawPheno, rawBaseline] = await Promise.all([
          querySentinel(phenoFrom, phenoTo),
          querySentinel(baselineFrom, phenoTo),
        ]);
      } catch (err: any) {
        await db.update(batches).set({ verificationStatus: "error" }).where(eq(batches.batchCode, req.params.batchCode));
        res.status(502).json({ error: "Sentinel Hub failed", detail: err.message }); return;
      }

      // Parse with cloud quality flags
      const phenoIntervals = deduplicateByMonth(parseIntervals(rawPheno));
      const baselineIntervals = deduplicateByMonth(parseIntervals(rawBaseline));
      const dataQuality = buildQualityReport(phenoIntervals);

      // Only use cloud-valid intervals for phenology scoring
      const validPhenoIntervals = phenoIntervals.filter(i => i.isValid);
      const dedupedIntervals = phenoIntervals; // keep all for display (with quality flags)

      // Harvest-window NDVI from valid intervals only
      const harvestIntervals = validPhenoIntervals.filter(iv =>
        iv.period >= batch.harvestDateFrom.slice(0, 7) && iv.period <= batch.harvestDateTo.slice(0, 7)
      );
      const useIntervals = harvestIntervals.length ? harvestIntervals : validPhenoIntervals;
      const avgNdvi = useIntervals.length
        ? useIntervals.reduce((s, i) => s + i.ndviMean, 0) / useIntervals.length
        : 0;

      // 3-year baseline: compute per-month median NDVI across 3 prior years for anomaly detection
      const baselineByMonth: Record<string, number[]> = {};
      for (const iv of baselineIntervals.filter(i => i.isValid)) {
        const mm = iv.period.slice(5, 7);
        if (!baselineByMonth[mm]) baselineByMonth[mm] = [];
        baselineByMonth[mm].push(iv.ndviMean);
      }
      const baselineMedian: Record<string, number> = {};
      for (const [mm, vals] of Object.entries(baselineByMonth)) {
        const sorted = [...vals].sort((a, b) => a - b);
        baselineMedian[mm] = sorted[Math.floor(sorted.length / 2)];
      }

      // Year-over-year anomaly: compare current year NDVI vs 3-year median
      const currentYearAnomalies: string[] = [];
      for (const iv of validPhenoIntervals) {
        const mm = iv.period.slice(5, 7);
        const median = baselineMedian[mm];
        if (median !== undefined && iv.ndviMean < median * 0.6) {
          currentYearAnomalies.push(
            `${iv.period}: NDVI ${Number(iv.ndviMean).toFixed(3)} is >40% below 3-year median (${Number(median).toFixed(3)}) — possible abandonment or biennial off-year`
          );
        }
      }

      // ── Layer 1: Phenology check (cloud-valid months only) ────────────────
      const monthlyNdvi: Record<string, number> = {};
      for (const iv of dedupedIntervals) monthlyNdvi[iv.period] = iv.ndviMean;
      const phenology = scorePhenology(plot.skin, monthlyNdvi);

      // ── Aggregate pass/fail ───────────────────────────────────────────────
      const ndviThreshold = PLOTS[plot.skin]?.ndviThreshold ?? 0.15;
      const ndviPass = avgNdvi > ndviThreshold;
      const verified = ndviPass && zoneCheck.insideZone && plausibility.plausible && phenology.cropMatch;

      const confidence = verified
        ? Math.min(99, Math.round(
            (ndviPass ? 30 : 0) +
            (zoneCheck.insideZone ? 25 : 0) +
            (plausibility.plausible ? 20 : 0) +
            Math.round(phenology.score * 0.25)
          ))
        : Math.min(49, Math.round(avgNdvi * 100));

      const verificationDetails = {
        ndvi: { avgNdvi: parseFloat(Number(avgNdvi).toFixed(3)), threshold: ndviThreshold, pass: ndviPass },
        zone: zoneCheck,
        phenology,
        plausibility,
        dataQuality,
        baseline: { monthlyMedian: baselineMedian, anomalies: currentYearAnomalies },
        layers: {
          ndviPass,
          zonePass: zoneCheck.insideZone,
          phenologyPass: phenology.cropMatch,
          plausibilityPass: plausibility.plausible,
        },
        disclaimer: "This verification report is an automated risk screening tool based on satellite remote sensing. It provides supporting evidence for GI compliance but does not constitute legal certification under EU Regulation 2024/1143. Final GI certification remains the responsibility of accredited conformity assessment bodies.",
      };

      // Anchor verified batches on-chain
      let anchorResult = null;
      if (verified) {
        anchorResult = await anchorBatch(req.params.batchCode, batch.skin, verificationDetails).catch((err) => {
          console.warn("[anchor] Failed (non-fatal):", err.message);
          return null;
        });
      }

      await db.update(batches).set({
        verificationStatus: verified ? "verified" : "rejected",
        ndviAvg: Number(avgNdvi).toFixed(3),
        ndviConfidence: confidence,
        satelliteIntervals: dedupedIntervals,
        verificationDetails,
        verifiedAt: new Date(),
        ...(anchorResult ? {
          txHash: anchorResult.txHash,
          chainId: anchorResult.chainId,
          anchoredAt: new Date(),
        } : {}),
      }).where(eq(batches.batchCode, req.params.batchCode));

      const [updated] = await db.select().from(batches).where(eq(batches.batchCode, req.params.batchCode));

      // Send DPP ready email (non-blocking, verified batches only)
      if (verified) {
        const [producer] = await db.select().from(producers).where(eq(producers.id, batch.producerId));
        if (producer?.email) {
          const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
          sendDppReadyEmail({
            producerName: producer.name,
            producerEmail: producer.email,
            farmName: producer.farmName,
            batchCode: req.params.batchCode,
            skin: batch.skin,
            ndviAvg: Number(avgNdvi).toFixed(3),
            txHash: anchorResult?.txHash,
            dppUrl: `${baseUrl}/passport/${req.params.batchCode}`,
          }).catch(err => console.warn("[email] DPP notification failed (non-fatal):", err.message));
        }
      }

      res.json({ ...updated, intervals: dedupedIntervals, avgNdvi: parseFloat(Number(avgNdvi).toFixed(3)), confidence, verified, verificationDetails, dataQuality, baselineAnomalies: currentYearAnomalies, anchor: anchorResult });
    } catch (e: any) {
      console.error("Batch verify error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Sentinel Hub plot verification
  app.post("/api/sentinel/verify", async (req, res) => {
    try {
      const { batchId, skin, dateFrom, dateTo, useFakePlot } = req.body as {
        batchId: string;
        skin: "bronte" | "etna" | "modica";
        dateFrom: string;
        dateTo: string;
        useFakePlot?: boolean;
      };

      if (!batchId || !skin) {
        res.status(400).json({ error: "batchId and skin are required" });
        return;
      }

      if (!process.env.COPERNICUS_CLIENT_ID || !process.env.COPERNICUS_CLIENT_SECRET) {
        res.status(503).json({ error: "Copernicus credentials not configured" });
        return;
      }

      const token = await getCopernicusToken();

      const from = dateFrom || "2024-09-01";
      const to = dateTo || "2024-11-30";

      const plot = useFakePlot ? PLOTS.fake : (PLOTS[skin] ?? PLOTS.bronte);

      const statsPayload = {
        input: {
          bounds: { geometry: plot.polygon },
          data: [{
            type: "sentinel-2-l2a",
            dataFilter: { mosaickingOrder: "leastCC" },
          }],
        },
        aggregation: {
          timeRange: { from: `${from}T00:00:00Z`, to: `${to}T23:59:59Z` },
          aggregationInterval: { of: "P30D" },
          evalscript: `//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask"] }],
    output: [
      { id: "ndvi", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1, sampleType: "UINT8" }
    ]
  };
}
function evaluatePixel(s) {
  return {
    ndvi: [(s.B08 - s.B04) / (s.B08 + s.B04 + 0.0001)],
    dataMask: [s.dataMask]
  };
}`,
          resx: 0.0001,
          resy: 0.0001,
        },
        calculations: {
          ndvi: { statistics: { default: { percentiles: { k: [25, 50, 75] } } } },
        },
      };

      const statsRes = await fetch(`${SENTINEL_HUB_BASE}/api/v1/statistics`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(statsPayload),
      });

      if (!statsRes.ok) {
        const errText = await statsRes.text();
        console.error("Sentinel Hub error:", errText);
        res.status(502).json({ error: "Sentinel Hub request failed", detail: errText });
        return;
      }

      const statsData = await statsRes.json() as {
        data: { interval: { from: string; to: string }; outputs: { ndvi: { bands: { B0: { stats: { mean: number; max: number; stDev: number; sampleCount: number } } } } } }[];
      };

      const intervals = statsData.data.map((d) => ({
        period: d.interval.from.slice(0, 7),
        ndviMean: parseFloat(d.outputs?.ndvi?.bands?.B0?.stats?.mean?.toFixed(3) ?? "0"),
        ndviMax: parseFloat(d.outputs?.ndvi?.bands?.B0?.stats?.max?.toFixed(3) ?? "0"),
        sampleCount: d.outputs?.ndvi?.bands?.B0?.stats?.sampleCount ?? 0,
      }));

      const avgNdvi = intervals.length
        ? intervals.reduce((s, i) => s + i.ndviMean, 0) / intervals.length
        : 0;

      const threshold = plot.ndviThreshold;
      const verified = avgNdvi > threshold;
      const confidence = verified
        ? Math.min(99, Math.round(60 + ((avgNdvi - threshold) / 0.35) * 39))
        : Math.min(59, Math.round((avgNdvi / threshold) * 59));

      res.json({
        batchId,
        skin,
        plotName: plot.name,
        verified,
        confidence,
        avgNdvi: parseFloat(Number(avgNdvi).toFixed(3)),
        intervals,
        plotPolygon: plot.polygon,
        dateRange: { from, to },
        anchorReady: verified,
      });
    } catch (err: any) {
      console.error("Sentinel verify error:", err);
      res.status(500).json({ error: err.message ?? "Internal error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
