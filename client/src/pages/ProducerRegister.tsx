import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { MapContainer, TileLayer, Polygon, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, MapPin, Satellite, ChevronRight, ChevronLeft, Leaf, Building2, Package } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

// ── Types ────────────────────────────────────────────────────────────────────

type Skin = "bronte" | "etna" | "modica" | "yubari";

interface LatLng { lat: number; lng: number; }

interface ProducerForm {
  name: string; farmName: string; email: string; password: string; phone: string;
  country: string; region: string; giCertificationNumber: string;
  giType: string; certificationBody: string;
  gdprConsent: boolean;
}

interface PlotForm {
  name: string; skin: Skin; polygon: [number, number][];
  altitudeM: string; areaHa: string; cadastralRef: string; notes: string;
}

interface BatchForm {
  batchCode: string; harvestDateFrom: string; harvestDateTo: string;
  quantityKg: string; varietyNotes: string;
}

// ── Skin config ───────────────────────────────────────────────────────────────

const SKINS: Record<Skin, { label: string; icon: string; center: [number, number]; zoom: number; hint: string }> = {
  bronte:  { label: "Bronte DOP Pistachio", icon: "🌿", center: [37.789, 14.833], zoom: 13, hint: "Click the map to draw your plot polygon. Min 3 points." },
  etna:    { label: "Etna DOC Wine",         icon: "🍷", center: [37.941, 14.952], zoom: 13, hint: "Draw the contrada boundary of your vineyard." },
  modica:  { label: "Modica IGP Chocolate",  icon: "🍫", center: [0.282,  6.720],  zoom: 13, hint: "Draw the cocoa plantation polygon (São Tomé)." },
  yubari:  { label: "Yubari Melon (Japan)",  icon: "🍈", center: [43.061, 141.994],zoom: 13, hint: "Draw the greenhouse / field boundary (Hokkaido)." },
};

const GI_TYPES = ["DOP", "DOC", "IGP"];
const CERT_BODIES = ["CSQA", "DNV", "Bureau Veritas", "ICIM", "Other"];
const STEPS = [
  { label: "Producer",  icon: Building2 },
  { label: "Plot",      icon: MapPin },
  { label: "Batch",     icon: Package },
  { label: "Verify",    icon: Satellite },
];

// ── Map polygon drawing ───────────────────────────────────────────────────────

function PolygonDrawer({ points, onChange }: { points: LatLng[]; onChange: (pts: LatLng[]) => void }) {
  useMapEvents({
    click(e) { onChange([...points, e.latlng]); },
  });
  return points.length >= 2 ? (
    <Polygon positions={points.map(p => [p.lat, p.lng])} pathOptions={{ color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.2 }} />
  ) : null;
}

// ── Field helpers ─────────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-cta/40";
const selectCls = `${inputCls} cursor-pointer`;

// ── Main component ────────────────────────────────────────────────────────────

export default function ProducerRegister() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Saved IDs after each POST
  const [producerId, setProducerId] = useState<string | null>(null);
  const [plotId, setPlotId]         = useState<string | null>(null);
  const [batchCode, setBatchCode]   = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<any | null>(null);

  // Form state
  const [producer, setProducer] = useState<ProducerForm>({
    name: "", farmName: "", email: "", password: "", phone: "",
    country: "IT", region: "", giCertificationNumber: "",
    giType: "DOP", certificationBody: "CSQA",
    gdprConsent: false,
  });

  const [plot, setPlot] = useState<PlotForm>({
    name: "", skin: "bronte", polygon: [],
    altitudeM: "", areaHa: "", cadastralRef: "", notes: "",
  });
  const [mapPoints, setMapPoints] = useState<LatLng[]>([]);

  const [batch, setBatch] = useState<BatchForm>({
    batchCode: "", harvestDateFrom: "", harvestDateTo: "",
    quantityKg: "", varietyNotes: "",
  });

  // ── Step 1: Submit producer ───────────────────────────────────────────────

  const submitProducer = async () => {
    setError(null);
    if (!producer.name || !producer.farmName || !producer.email) {
      setError("Name, farm name, and email are required."); return;
    }
    if (!producer.password || producer.password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    if (!producer.gdprConsent) {
      setError("You must accept the data processing terms to continue."); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...producer, giType: producer.giType || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to register producer"); return; }
      setProducerId(data.id);
      trackEvent("producer_registered", "registration", producer.farmName);
      setStep(1);
      // Session is now set — producer is logged in
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  // ── Step 2: Submit plot ───────────────────────────────────────────────────

  const finalisePolygon = useCallback(() => {
    if (mapPoints.length < 3) { setError("Draw at least 3 points on the map."); return; }
    const coords: [number, number][] = mapPoints.map(p => [p.lng, p.lat]);
    coords.push(coords[0]); // close ring
    setPlot(p => ({ ...p, polygon: coords }));
  }, [mapPoints]);

  const submitPlot = async () => {
    setError(null);
    if (!plot.name) { setError("Plot name is required."); return; }
    if (plot.polygon.length < 4) { setError("Draw and finalise the polygon first."); return; }
    if (!producerId) { setError("Producer not registered."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/plots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producerId,
          name: plot.name,
          skin: plot.skin,
          polygon: { type: "Polygon", coordinates: [plot.polygon] },
          altitudeM: plot.altitudeM ? parseInt(plot.altitudeM) : undefined,
          areaSqm: plot.areaHa ? Math.round(parseFloat(plot.areaHa) * 10000) : undefined,
          cadastralRef: plot.cadastralRef || undefined,
          notes: plot.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to register plot"); return; }
      setPlotId(data.id);
      trackEvent("plot_registered", "registration", plot.skin);
      // Auto-generate batch code
      const year = new Date().getFullYear();
      const prefix = plot.skin === "bronte" ? "BRN" : plot.skin === "etna" ? "ETN" : plot.skin === "modica" ? "MOD" : "YUB";
      setBatch(b => ({ ...b, batchCode: `${prefix}-${year}-001` }));
      setStep(2);
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  // ── Step 3: Submit batch ──────────────────────────────────────────────────

  const submitBatch = async () => {
    setError(null);
    if (!batch.batchCode || !batch.harvestDateFrom || !batch.harvestDateTo) {
      setError("Batch code and harvest dates are required."); return;
    }
    if (!batch.quantityKg || parseFloat(batch.quantityKg) <= 0) {
      setError("Declared quantity (kg) is required for the yield plausibility check."); return;
    }
    if (!producerId || !plotId) { setError("Producer or plot missing."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producerId, plotId,
          batchCode: batch.batchCode,
          skin: plot.skin,
          harvestDateFrom: batch.harvestDateFrom,
          harvestDateTo: batch.harvestDateTo,
          quantityKg: batch.quantityKg ? parseFloat(batch.quantityKg) : undefined,
          varietyNotes: batch.varietyNotes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to register batch"); return; }
      setBatchCode(data.batchCode);
      trackEvent("batch_registered", "registration", batch.batchCode);
      setStep(3);
      // Auto-trigger verification
      runVerification(data.batchCode);
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  // ── Step 4: Verify ────────────────────────────────────────────────────────

  const runVerification = async (code: string) => {
    try {
      const res = await fetch(`/api/batches/${code}/verify`, { method: "POST" });
      const data = await res.json();
      setVerifyResult(data);
    } catch (e: any) {
      setVerifyResult({ error: "We couldn't complete the satellite query. Please check your connection and retry." });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const skin = SKINS[plot.skin];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => setLocation("/green-agent")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> Green Agent
          </button>
          <span className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Leaf className="w-4 h-4 text-cta" /> Producer Registration</span>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Step indicator */}
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  done   ? "bg-cta border-cta text-white"
                  : active ? "border-cta text-cta"
                  : "border-border text-muted-foreground"
                }`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                {i < STEPS.length - 1 && <div className={`hidden sm:block absolute h-0.5 w-16 translate-x-16 -translate-y-6 ${done ? "bg-cta" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        {/* ── STEP 0: Producer ── */}
        {step === 0 && (
          <Card className="p-6 space-y-4">
            <h2 className="font-bold text-foreground text-lg">Producer Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full name" required>
                <input className={inputCls} value={producer.name} onChange={e => setProducer(p => ({...p, name: e.target.value}))} placeholder="Andrea Amenta" />
              </Field>
              <Field label="Farm / company name" required>
                <input className={inputCls} value={producer.farmName} onChange={e => setProducer(p => ({...p, farmName: e.target.value}))} placeholder="Azienda Agricola..." />
              </Field>
              <Field label="Email" required>
                <input className={inputCls} type="email" value={producer.email} onChange={e => setProducer(p => ({...p, email: e.target.value}))} placeholder="you@farm.it" />
              </Field>
              <Field label="Password" required>
                <input className={inputCls} type="password" value={producer.password} onChange={e => setProducer(p => ({...p, password: e.target.value}))} placeholder="Min. 8 characters" autoComplete="new-password" />
              </Field>
              <Field label="Phone">
                <input className={inputCls} value={producer.phone} onChange={e => setProducer(p => ({...p, phone: e.target.value}))} placeholder="+39 ..." />
              </Field>
              <Field label="Region">
                <input className={inputCls} value={producer.region} onChange={e => setProducer(p => ({...p, region: e.target.value}))} placeholder="Sicilia" />
              </Field>
              <Field label="GI type">
                <select className={selectCls} value={producer.giType} onChange={e => setProducer(p => ({...p, giType: e.target.value}))}>
                  {GI_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="GI certification number">
                <input className={inputCls} value={producer.giCertificationNumber} onChange={e => setProducer(p => ({...p, giCertificationNumber: e.target.value}))} placeholder="IT-DOP-..." />
              </Field>
              <Field label="Certification body">
                <select className={selectCls} value={producer.certificationBody} onChange={e => setProducer(p => ({...p, certificationBody: e.target.value}))}>
                  {CERT_BODIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            {/* GDPR consent */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={producer.gdprConsent}
                onChange={e => setProducer(p => ({ ...p, gdprConsent: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-border accent-cta cursor-pointer"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I consent to VirtusGreen processing my data (name, email, farm details, plot coordinates) for GI provenance verification purposes, in accordance with GDPR and EU Regulation 2024/1143.{" "}
                <a href="/privacy" className="text-cta underline hover:no-underline" target="_blank">Privacy Policy</a>
              </span>
            </label>

            <Button className="w-full bg-cta hover:bg-cta/90 text-cta-foreground mt-2" onClick={submitProducer} disabled={submitting || !producer.gdprConsent}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>}
            </Button>
          </Card>
        )}

        {/* ── STEP 1: Plot ── */}
        {step === 1 && (
          <Card className="p-6 space-y-4">
            <h2 className="font-bold text-foreground text-lg">Register Your Plot</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Plot name" required>
                <input className={inputCls} value={plot.name} onChange={e => setPlot(p => ({...p, name: e.target.value}))} placeholder="Contrada Difesa Nord" />
              </Field>
              <Field label="Product skin" required>
                <select className={selectCls} value={plot.skin} onChange={e => {
                  const s = e.target.value as Skin;
                  setPlot(p => ({...p, skin: s, polygon: []}));
                  setMapPoints([]);
                }}>
                  {(Object.entries(SKINS) as [Skin, typeof SKINS[Skin]][]).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Altitude (m)">
                <input className={inputCls} type="number" value={plot.altitudeM} onChange={e => setPlot(p => ({...p, altitudeM: e.target.value}))} placeholder="700" />
              </Field>
              <Field label="Area (ha)">
                <input className={inputCls} type="number" step="0.01" value={plot.areaHa} onChange={e => setPlot(p => ({...p, areaHa: e.target.value}))} placeholder="0.50" />
              </Field>
              <Field label="Cadastral reference">
                <input className={inputCls} value={plot.cadastralRef} onChange={e => setPlot(p => ({...p, cadastralRef: e.target.value}))} placeholder="Foglio 12 – Particella 345" />
              </Field>
              <Field label="Notes">
                <input className={inputCls} value={plot.notes} onChange={e => setPlot(p => ({...p, notes: e.target.value}))} placeholder="North-facing, volcanic soil" />
              </Field>
            </div>

            {/* Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Plot polygon — click to add points
                </label>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">{mapPoints.length} points</Badge>
                  {mapPoints.length > 0 && (
                    <button onClick={() => { setMapPoints([]); setPlot(p => ({...p, polygon: []})); }}
                      className="text-xs text-muted-foreground hover:text-foreground underline">Reset</button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{skin.hint}</p>
              <div className="rounded-lg overflow-hidden border border-border" style={{ height: 320 }}>
                <MapContainer center={skin.center} zoom={skin.zoom} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
                  />
                  <PolygonDrawer points={mapPoints} onChange={setMapPoints} />
                </MapContainer>
              </div>
              <Button
                variant="outline"
                className="w-full border-cta/40 text-cta hover:bg-cta/5"
                onClick={finalisePolygon}
                disabled={mapPoints.length < 3}
              >
                Finalise polygon ({mapPoints.length} points)
              </Button>
              {plot.polygon.length > 0 && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Polygon saved — {plot.polygon.length - 1} points
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button className="flex-1 bg-cta hover:bg-cta/90 text-cta-foreground" onClick={submitPlot} disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>}
              </Button>
            </div>
          </Card>
        )}

        {/* ── STEP 2: Batch ── */}
        {step === 2 && (
          <Card className="p-6 space-y-4">
            <h2 className="font-bold text-foreground text-lg">Register Batch</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Batch code" required>
                <input className={inputCls} value={batch.batchCode} onChange={e => setBatch(b => ({...b, batchCode: e.target.value}))} placeholder="BRN-2026-001" />
              </Field>
              <Field label="Declared quantity (kg)" required>
                <input className={inputCls} type="number" value={batch.quantityKg} onChange={e => setBatch(b => ({...b, quantityKg: e.target.value}))} placeholder="1200" />
              </Field>
              <Field label="Harvest from" required>
                <input className={inputCls} type="date" value={batch.harvestDateFrom} onChange={e => setBatch(b => ({...b, harvestDateFrom: e.target.value}))} />
              </Field>
              <Field label="Harvest to" required>
                <input className={inputCls} type="date" value={batch.harvestDateTo} onChange={e => setBatch(b => ({...b, harvestDateTo: e.target.value}))} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Variety / notes">
                  <input className={inputCls} value={batch.varietyNotes} onChange={e => setBatch(b => ({...b, varietyNotes: e.target.value}))} placeholder="Napoletana variety, hand-picked" />
                </Field>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button className="flex-1 bg-cta hover:bg-cta/90 text-cta-foreground" onClick={submitBatch} disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <>Submit & Verify <Satellite className="w-4 h-4 ml-1" /></>}
              </Button>
            </div>
          </Card>
        )}

        {/* ── STEP 3: Verification result ── */}
        {step === 3 && (
          <Card className="p-6 space-y-5">
            <h2 className="font-bold text-foreground text-lg">Satellite Verification</h2>

            {!verifyResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-cta shrink-0" />
                  Running satellite verification — this takes 15–30 seconds
                </div>
                <div className="pl-8 space-y-1.5 text-xs text-muted-foreground">
                  <p>🛰️ Querying 12 months of Copernicus Sentinel-2 imagery for your plot</p>
                  <p>☁️ Applying cloud masking and computing NDVI vegetation index</p>
                  <p>📍 Cross-checking GI zone boundary and crop phenology</p>
                  <p>⛓️ Anchoring verified result on Ethereum Sepolia</p>
                </div>
              </div>
            )}

            {verifyResult && !verifyResult.error && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Batch: {batchCode}</span>
                  <Badge className={verifyResult.verified
                    ? "bg-green-500/15 text-green-600 border-green-500/30"
                    : "bg-red-500/15 text-red-600 border-red-500/30"}>
                    {verifyResult.verified ? <><CheckCircle2 className="w-3 h-3 mr-1" />All layers passed</> : "Verification failed"}
                  </Badge>
                </div>

                {/* Layer summary */}
                {verifyResult.verificationDetails && (() => {
                  const d = verifyResult.verificationDetails;
                  const layers = [
                    { label: "NDVI satellite signal",    pass: d.layers.ndviPass,        detail: `Avg NDVI ${d.ndvi.avgNdvi} (threshold ${d.ndvi.threshold})` },
                    { label: "GI zone boundary",          pass: d.layers.zonePass,         detail: d.zone.insideZone ? d.zone.zoneName : `Outside zone — ${d.zone.distanceKm} km away` },
                    { label: "Crop phenology match",      pass: d.layers.phenologyPass,    detail: `${d.phenology.score}/100 — ${d.phenology.profile}` },
                    { label: "Area-yield plausibility",  pass: d.layers.plausibilityPass, detail: d.plausibility.flags[0] ?? `${d.plausibility.plotAreaHa.toFixed(2)} ha · max ${d.plausibility.maxRealisticKg.toLocaleString()} kg` },
                  ];
                  return (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Verification layers</p>
                      {layers.map((l, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <span className={`mt-0.5 shrink-0 ${l.pass ? "text-green-500" : "text-red-500"}`}>
                            {l.pass ? "✓" : "✗"}
                          </span>
                          <div>
                            <span className="font-medium text-foreground">{l.label}</span>
                            <span className="text-muted-foreground ml-2 text-xs">{l.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Monthly NDVI chart */}
                {verifyResult.intervals?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">12-month NDVI (phenology window)</p>
                    {verifyResult.intervals.map((iv: any) => (
                      <div key={iv.period} className="flex items-center gap-3 text-sm">
                        <span className="w-16 text-muted-foreground shrink-0 text-xs">{iv.period}</span>
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div className="h-2 rounded-full bg-cta" style={{ width: `${Math.max(0, Math.min(100, ((iv.ndviMean + 1) / 2) * 100))}%` }} />
                        </div>
                        <span className="w-12 text-right text-muted-foreground text-xs">{iv.ndviMean.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Phenology mismatches */}
                {verifyResult.verificationDetails?.phenology?.mismatches?.length > 0 && (
                  <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 space-y-1">
                    <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Phenology anomalies</p>
                    {verifyResult.verificationDetails.phenology.mismatches.map((m: string, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground">{m}</p>
                    ))}
                  </div>
                )}

                {verifyResult.verified && (
                  <div className="rounded-lg border border-cta/30 bg-cta/5 p-4 space-y-3">
                    <p className="text-xs font-semibold text-cta uppercase tracking-wide">✓ All layers passed</p>
                    {verifyResult.anchor?.txHash ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Anchored on Ethereum Sepolia</p>
                        <a
                          href={verifyResult.anchor.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-cta hover:underline break-all"
                        >
                          {verifyResult.anchor.txHash}
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">On-chain anchoring skipped (no contract configured).</p>
                    )}
                    <Button
                      className="w-full bg-cta hover:bg-cta/90 text-cta-foreground text-sm"
                      onClick={() => setLocation(`/passport/${batchCode}`)}
                    >
                      View Digital Product Passport →
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-sm"
                      onClick={() => setLocation("/producer/dashboard")}
                    >
                      Go to my dashboard →
                    </Button>
                  </div>
                )}

                <Button variant="outline" className="w-full" onClick={() => setLocation("/green-agent")}>
                  Back to Green Agent
                </Button>
              </div>
            )}

            {verifyResult?.error && (
              <div className="text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                <p className="font-medium">Verification could not be completed</p>
                <p className="text-xs text-muted-foreground">
                  {verifyResult.error.includes("Sentinel") || verifyResult.error.includes("satellite")
                    ? "We couldn't reach the satellite data service. This is usually temporary — please wait a moment and retry."
                    : verifyResult.error}
                </p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => batchCode && runVerification(batchCode)}>
                  Retry verification
                </Button>
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
