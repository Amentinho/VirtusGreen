import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";
import { sendContactFormEmail } from "./email";

// Copernicus Sentinel Hub helpers
const COPERNICUS_TOKEN_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";
const SENTINEL_HUB_BASE = "https://sh.dataspace.copernicus.eu";

// Pre-seeded Bronte pistachio plot polygon (Contrada Difesa, Bronte CT)
const BRONTE_PLOT_GEOJSON = {
  type: "Polygon",
  coordinates: [[
    [14.8312, 37.7891],
    [14.8356, 37.7891],
    [14.8356, 37.7921],
    [14.8312, 37.7921],
    [14.8312, 37.7891],
  ]],
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

  // Sentinel Hub plot verification
  app.post("/api/sentinel/verify", async (req, res) => {
    try {
      const { batchId, skin, dateFrom, dateTo } = req.body as {
        batchId: string;
        skin: "bronte" | "etna" | "modica";
        dateFrom: string;
        dateTo: string;
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

      const statsPayload = {
        input: {
          bounds: { geometry: BRONTE_PLOT_GEOJSON },
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
          resx: 10,
          resy: 10,
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

      // Interpret NDVI for pistachio: active canopy > 0.35, harvest dip expected Sep–Oct
      const intervals = statsData.data.map((d) => ({
        period: d.interval.from.slice(0, 7),
        ndviMean: parseFloat(d.outputs?.ndvi?.bands?.B0?.stats?.mean?.toFixed(3) ?? "0"),
        ndviMax: parseFloat(d.outputs?.ndvi?.bands?.B0?.stats?.max?.toFixed(3) ?? "0"),
        sampleCount: d.outputs?.ndvi?.bands?.B0?.stats?.sampleCount ?? 0,
      }));

      const avgNdvi = intervals.length
        ? intervals.reduce((s, i) => s + i.ndviMean, 0) / intervals.length
        : 0;

      const verified = avgNdvi > 0.15;
      // Scale: 0.15 (threshold) = 60%, 0.5+ = 99%
      const confidence = verified
        ? Math.min(99, Math.round(60 + ((avgNdvi - 0.15) / 0.35) * 39))
        : Math.min(59, Math.round((avgNdvi / 0.15) * 59));

      res.json({
        batchId,
        skin,
        verified,
        confidence,
        avgNdvi: parseFloat(avgNdvi.toFixed(3)),
        intervals,
        plotPolygon: BRONTE_PLOT_GEOJSON,
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
