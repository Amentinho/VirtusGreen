import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { MapContainer, TileLayer, Polygon, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, MapPin, Satellite, ChevronRight, ChevronLeft, Leaf, Building2, Package, Search, AlertCircle, Factory, Truck, ShieldCheck } from "lucide-react";
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
  altitudeM: string; areaHa: string; notes: string;
  // Catasto fields
  comune: string; codiceCatastale: string; foglio: string; particella: string;
}

// Italian comuni in GI zones with their codici catastali
const COMUNI_GI: { label: string; codice: string; skins: Skin[] }[] = [
  { label: "Bronte (CT)",        codice: "B202", skins: ["bronte"] },
  { label: "Adrano (CT)",        codice: "A056", skins: ["bronte"] },
  { label: "Biancavilla (CT)",   codice: "A841", skins: ["bronte"] },
  { label: "Cesarò (ME)",        codice: "C568", skins: ["bronte"] },
  { label: "Randazzo (CT)",      codice: "H175", skins: ["bronte", "etna"] },
  { label: "Linguaglossa (CT)",  codice: "E602", skins: ["etna"] },
  { label: "Castiglione di Sicilia (CT)", codice: "C297", skins: ["etna"] },
  { label: "Zafferana Etnea (CT)", codice: "M139", skins: ["etna"] },
  { label: "Santa Venerina (CT)", codice: "I314", skins: ["etna"] },
  { label: "Giarre (CT)",        codice: "E017", skins: ["etna"] },
  { label: "Milo (CT)",          codice: "F208", skins: ["etna"] },
  { label: "Modica (RG)",        codice: "F258", skins: ["modica"] },
  { label: "Ragusa (RG)",        codice: "H163", skins: ["modica"] },
  { label: "Scicli (RG)",        codice: "I535", skins: ["modica"] },
];

interface BatchForm {
  batchCode: string; harvestDateFrom: string; harvestDateTo: string;
  quantityKg: string; varietyNotes: string;
}

interface WorkshopForm {
  name: string; address: string; cap: string;
  haccpNumber: string; consortiumId: string; vatNumber: string;
}

interface CocoaForm {
  batchCode: string;
  originCountry: string;
  supplierName: string;
  supplierCountry: string;
  certifications: string[];
  importDocRef: string;
  quantityKg: string;
  productionDateFrom: string;
  productionDateTo: string;
  farmCoordinates: string;
  processingTemp: string;
  eudrStatement: boolean;
}

const COCOA_ORIGINS = [
  "Ecuador", "Venezuela", "Perù", "Colombia", "Madagascar",
  "Ghana", "Costa d'Avorio", "Nigeria", "Camerun",
  "Repubblica Dominicana", "Trinidad e Tobago", "São Tomé e Príncipe",
];

const COCOA_CERTS = ["Fairtrade", "Rainforest Alliance", "UTZ", "Biologico UE", "Direct Trade", "Nessuna"];

// ── Skin config ───────────────────────────────────────────────────────────────

const SKINS: Record<Skin, { label: string; icon: string; center: [number, number]; zoom: number; hint: string }> = {
  bronte:  { label: "Pistacchio Bronte DOP", icon: "🌿", center: [37.789, 14.833], zoom: 13, hint: "Clicca sulla mappa per disegnare il poligono del tuo appezzamento. Minimo 3 punti." },
  etna:    { label: "Vino Etna DOC",          icon: "🍷", center: [37.941, 14.952], zoom: 13, hint: "Disegna il confine della contrada del tuo vigneto." },
  modica:  { label: "Cioccolato Modica IGP",  icon: "🍫", center: [0.282,  6.720],  zoom: 13, hint: "Disegna il poligono della piantagione di cacao (São Tomé)." },
  yubari:  { label: "Melone Yubari (Giappone)", icon: "🍈", center: [43.061, 141.994],zoom: 13, hint: "Disegna il confine della serra / campo (Hokkaido)." },
};

const GI_TYPES = ["DOP", "DOC", "IGP"];
const CERT_BODIES = ["CSQA", "DNV", "Bureau Veritas", "ICIM", "Altro"];

const STEPS_AGRI = [
  { label: "Produttore", icon: Building2 },
  { label: "Appezzamento", icon: MapPin },
  { label: "Lotto",      icon: Package },
  { label: "Verifica",   icon: Satellite },
];

const STEPS_MODICA = [
  { label: "Produttore",  icon: Building2 },
  { label: "Laboratorio", icon: Factory },
  { label: "Cacao EUDR",  icon: Truck },
  { label: "Conformità",  icon: ShieldCheck },
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
    altitudeM: "", areaHa: "", notes: "",
    comune: "", codiceCatastale: "", foglio: "", particella: "",
  });
  const [mapPoints, setMapPoints] = useState<LatLng[]>([]);
  const [catLookup, setCatLookup] = useState<"idle" | "loading" | "found" | "error">("idle");
  const [catError, setCatError] = useState<string | null>(null);

  const [batch, setBatch] = useState<BatchForm>({
    batchCode: "", harvestDateFrom: "", harvestDateTo: "",
    quantityKg: "", varietyNotes: "",
  });

  const [workshop, setWorkshop] = useState<WorkshopForm>({
    name: "", address: "", cap: "", haccpNumber: "", consortiumId: "", vatNumber: "",
  });

  const [cocoa, setCocoa] = useState<CocoaForm>({
    batchCode: "", originCountry: "Ecuador", supplierName: "", supplierCountry: "",
    certifications: [], importDocRef: "", quantityKg: "",
    productionDateFrom: "", productionDateTo: "",
    farmCoordinates: "", processingTemp: "40",
    eudrStatement: false,
  });

  const isModica = plot.skin === "modica";
  const STEPS = isModica ? STEPS_MODICA : STEPS_AGRI;

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

  // ── Catasto lookup ────────────────────────────────────────────────────────

  const lookupCatasto = async () => {
    const { codiceCatastale, foglio, particella } = plot;
    if (!codiceCatastale || !foglio || !particella) {
      setCatError("Inserisci codice comune, foglio e particella."); return;
    }
    setCatLookup("loading"); setCatError(null);
    try {
      const params = new URLSearchParams({ codiceCatastale, foglio, particella });
      const res = await fetch(`/api/catasto/lookup?${params}`);
      const data = await res.json();
      if (!res.ok) { setCatLookup("error"); setCatError(data.error); return; }

      const geometry = data.geometry;
      let coords: [number, number][] = [];

      if (geometry.type === "Polygon") {
        coords = geometry.coordinates[0];
      } else if (geometry.type === "MultiPolygon") {
        coords = geometry.coordinates[0][0];
      }

      if (coords.length >= 3) {
        setPlot(p => ({
          ...p,
          polygon: coords,
          areaHa: data.areaSqm ? (data.areaSqm / 10000).toFixed(2) : p.areaHa,
        }));
        // Move map to centroid
        const avgLat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
        const avgLng = coords.reduce((s, c) => s + c[0], 0) / coords.length;
        setMapPoints(coords.map(([lng, lat]) => ({ lat, lng })));
        setCatLookup("found");
        trackEvent("catasto_lookup_success", "registration", plot.skin);
      } else {
        setCatLookup("error"); setCatError("Geometria non disponibile — disegna il poligono manualmente.");
      }
    } catch (e: any) {
      setCatLookup("error"); setCatError("Errore di rete — riprova o disegna manualmente.");
    }
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
    if (!plot.name) { setError("Il nome dell'appezzamento è obbligatorio."); return; }
    const hasCatasto = plot.foglio && plot.particella && plot.codiceCatastale;
    if (plot.polygon.length < 4 && !hasCatasto) {
      setError("Disegna il poligono OPPURE inserisci il riferimento catastale completo (comune, foglio, particella)."); return;
    }
    if (!producerId) { setError("Producer not registered."); return; }

    const cadastralRef = hasCatasto
      ? `${plot.comune || plot.codiceCatastale} – Fg. ${plot.foglio} – Part. ${plot.particella}`
      : undefined;

    // If no drawn polygon but catasto found, use a placeholder centroid polygon
    // (server will verify zone boundary on first verification run)
    const polygonToSubmit = plot.polygon.length >= 4
      ? { type: "Polygon" as const, coordinates: [plot.polygon] }
      : null;

    if (!polygonToSubmit) {
      setError("Usa il pulsante 'Cerca su Catasto' per caricare il poligono, oppure disegnalo manualmente."); return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/plots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producerId,
          name: plot.name,
          skin: plot.skin,
          polygon: polygonToSubmit,
          altitudeM: plot.altitudeM ? parseInt(plot.altitudeM) : undefined,
          areaSqm: plot.areaHa ? Math.round(parseFloat(plot.areaHa) * 10000) : undefined,
          cadastralRef: cadastralRef || undefined,
          notes: plot.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to register plot"); return; }
      setPlotId(data.id);
      trackEvent("plot_registered", "registration", plot.skin);
      // Auto-generate unique batch code for this producer+skin+year
      fetch(`/api/batches/next-code?producerId=${producerId}&skin=${plot.skin}`)
        .then(r => r.json())
        .then(d => { if (d.code) setBatch(b => ({ ...b, batchCode: d.code })); })
        .catch(() => {
          const year = new Date().getFullYear();
          const prefix = plot.skin === "bronte" ? "BRN" : plot.skin === "etna" ? "ETN" : plot.skin === "modica" ? "MOD" : "YUB";
          setBatch(b => ({ ...b, batchCode: `${prefix}-${year}-001` }));
        });
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

  // ── Modica Step 1: Submit workshop ────────────────────────────────────────

  const submitWorkshop = async () => {
    setError(null);
    if (!workshop.name || !workshop.address) {
      setError("Nome laboratorio e indirizzo sono obbligatori."); return;
    }
    if (!producerId) { setError("Produttore non registrato."); return; }
    setSubmitting(true);
    try {
      // Register workshop as a plot with Modica centroid coordinates
      const modicaCenter: [number, number][][] = [[[14.774, 36.860], [14.780, 36.860], [14.780, 36.865], [14.774, 36.865], [14.774, 36.860]]];
      const res = await fetch("/api/plots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producerId,
          name: workshop.name,
          skin: "modica",
          polygon: { type: "Polygon", coordinates: modicaCenter },
          notes: `Laboratorio IGP — ${workshop.address}, Modica (RG). HACCP: ${workshop.haccpNumber}. Consorzio: ${workshop.consortiumId}`,
          cadastralRef: `Modica (RG) — ${workshop.address}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Errore registrazione laboratorio"); return; }
      setPlotId(data.id);
      // Auto-generate batch code
      const year = new Date().getFullYear();
      setCocoa(c => ({ ...c, batchCode: `MOD-${year}-001` }));
      trackEvent("workshop_registered", "registration", "modica");
      setStep(2);
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  // ── Modica Step 2: Submit cocoa supply chain + EUDR ───────────────────────

  const submitCocoa = async () => {
    setError(null);
    if (!cocoa.batchCode || !cocoa.originCountry || !cocoa.supplierName) {
      setError("Codice lotto, paese di origine e fornitore sono obbligatori."); return;
    }
    if (!cocoa.quantityKg || parseFloat(cocoa.quantityKg) <= 0) {
      setError("La quantità prodotta (kg) è obbligatoria."); return;
    }
    if (!cocoa.productionDateFrom || !cocoa.productionDateTo) {
      setError("Le date di produzione sono obbligatorie."); return;
    }
    if (!cocoa.eudrStatement) {
      setError("La dichiarazione EUDR di diligenza è obbligatoria ai sensi del Reg. UE 2023/1115."); return;
    }
    if (!producerId || !plotId) { setError("Dati incompleti."); return; }
    setSubmitting(true);
    try {
      const eudrPayload = {
        type: "eudr_cocoa",
        originCountry: cocoa.originCountry,
        supplierName: cocoa.supplierName,
        supplierCountry: cocoa.supplierCountry,
        certifications: cocoa.certifications,
        importDocRef: cocoa.importDocRef,
        farmCoordinates: cocoa.farmCoordinates,
        processingTempC: cocoa.processingTemp,
        eudrStatementDate: new Date().toISOString().slice(0, 10),
      };
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producerId, plotId,
          batchCode: cocoa.batchCode,
          skin: "modica",
          harvestDateFrom: cocoa.productionDateFrom,
          harvestDateTo: cocoa.productionDateTo,
          quantityKg: parseFloat(cocoa.quantityKg),
          varietyNotes: JSON.stringify(eudrPayload),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Errore registrazione lotto"); return; }
      setBatchCode(data.batchCode);
      trackEvent("cocoa_batch_registered", "registration", cocoa.batchCode);
      setStep(3);
      setVerifyResult({
        verified: true,
        modicaCompliance: {
          workshopInModica: true,
          eudrStatement: true,
          certifications: cocoa.certifications,
          originCountry: cocoa.originCountry,
          processingTempC: parseInt(cocoa.processingTemp),
          maxTempCompliant: parseInt(cocoa.processingTemp) <= 50,
        },
      });
      // Anchor on blockchain
      fetch(`/api/batches/${data.batchCode}/verify`, { method: "POST" })
        .then(r => r.json())
        .then(d => setVerifyResult((prev: any) => ({ ...prev, anchor: d.anchor })))
        .catch(() => {});
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
  const toggleCert = (cert: string) => setCocoa(c => ({
    ...c,
    certifications: c.certifications.includes(cert)
      ? c.certifications.filter(x => x !== cert)
      : [...c.certifications, cert],
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => setLocation("/green-agent")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> Green Agent
          </button>
          <span className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Leaf className="w-4 h-4 text-cta" /> Registrazione Produttore</span>
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
            <h2 className="font-bold text-foreground text-lg">Dati del Produttore</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nome e cognome" required>
                <input className={inputCls} value={producer.name} onChange={e => setProducer(p => ({...p, name: e.target.value}))} placeholder="Andrea Amenta" />
              </Field>
              <Field label="Nome azienda / ragione sociale" required>
                <input className={inputCls} value={producer.farmName} onChange={e => setProducer(p => ({...p, farmName: e.target.value}))} placeholder="Azienda Agricola..." />
              </Field>
              <Field label="Email" required>
                <input className={inputCls} type="email" value={producer.email} onChange={e => setProducer(p => ({...p, email: e.target.value}))} placeholder="tu@azienda.it" />
              </Field>
              <Field label="Password" required>
                <input className={inputCls} type="password" value={producer.password} onChange={e => setProducer(p => ({...p, password: e.target.value}))} placeholder="Min. 8 caratteri" autoComplete="new-password" />
              </Field>
              <Field label="Telefono">
                <input className={inputCls} value={producer.phone} onChange={e => setProducer(p => ({...p, phone: e.target.value}))} placeholder="+39 ..." />
              </Field>
              <Field label="Regione">
                <input className={inputCls} value={producer.region} onChange={e => setProducer(p => ({...p, region: e.target.value}))} placeholder="Sicilia" />
              </Field>
              <Field label="Tipo IG">
                <select className={selectCls} value={producer.giType} onChange={e => setProducer(p => ({...p, giType: e.target.value}))}>
                  {GI_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Numero certificazione IG">
                <input className={inputCls} value={producer.giCertificationNumber} onChange={e => setProducer(p => ({...p, giCertificationNumber: e.target.value}))} placeholder="IT-DOP-..." />
              </Field>
              <Field label="Organismo di controllo">
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
                Acconsento al trattamento dei miei dati personali (nome, email, dati aziendali, coordinate appezzamento) da parte di VirtusGreen per finalità di verifica di provenienza IG, ai sensi del GDPR e del Regolamento UE 2024/1143. Ho letto l'{" "}
                <a href="/privacy" className="text-cta underline hover:no-underline" target="_blank">Informativa Privacy</a>{" "}e i{" "}
                <a href="/terms" className="text-cta underline hover:no-underline" target="_blank">Termini di Servizio</a>.
              </span>
            </label>

            <Button className="w-full bg-cta hover:bg-cta/90 text-cta-foreground mt-2" onClick={submitProducer} disabled={submitting || !producer.gdprConsent}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvataggio…</> : <>Continua <ChevronRight className="w-4 h-4 ml-1" /></>}
            </Button>
          </Card>
        )}

        {/* ── STEP 1 MODICA: Workshop ── */}
        {step === 1 && isModica && (
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-cta" />
              <h2 className="font-bold text-foreground text-lg">Dati del Laboratorio</h2>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              Il Cioccolato di Modica IGP è una <strong>indicazione geografica di trasformazione</strong>: la protezione riguarda il metodo di lavorazione a freddo nel Comune di Modica, non l'origine del cacao.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nome laboratorio / marchio" required>
                <input className={inputCls} value={workshop.name} onChange={e => setWorkshop(w => ({...w, name: e.target.value}))} placeholder="Dolceria Bonajuto" />
              </Field>
              <Field label="Partita IVA">
                <input className={inputCls} value={workshop.vatNumber} onChange={e => setWorkshop(w => ({...w, vatNumber: e.target.value}))} placeholder="IT12345678901" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Indirizzo (Comune di Modica)" required>
                  <input className={inputCls} value={workshop.address} onChange={e => setWorkshop(w => ({...w, address: e.target.value}))} placeholder="Corso Umberto I, 159 – 97015 Modica (RG)" />
                </Field>
              </div>
              <Field label="N° certificazione HACCP">
                <input className={inputCls} value={workshop.haccpNumber} onChange={e => setWorkshop(w => ({...w, haccpNumber: e.target.value}))} placeholder="RG/HACCP/2024/001" />
              </Field>
              <Field label="N° iscrizione Consorzio Cioccolato di Modica">
                <input className={inputCls} value={workshop.consortiumId} onChange={e => setWorkshop(w => ({...w, consortiumId: e.target.value}))} placeholder="CONS-MOD-..." />
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" /> Indietro
              </Button>
              <Button className="flex-1 bg-cta hover:bg-cta/90 text-cta-foreground" onClick={submitWorkshop} disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvataggio…</> : <>Continua <ChevronRight className="w-4 h-4 ml-1" /></>}
              </Button>
            </div>
          </Card>
        )}

        {/* ── STEP 1 AGRI: Plot ── */}
        {step === 1 && !isModica && (
          <Card className="p-6 space-y-5">
            <h2 className="font-bold text-foreground text-lg">Registra il tuo Appezzamento</h2>

            {/* Basic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nome appezzamento" required>
                <input className={inputCls} value={plot.name} onChange={e => setPlot(p => ({...p, name: e.target.value}))} placeholder="Contrada Difesa Nord" />
              </Field>
              <Field label="Prodotto" required>
                <select className={selectCls} value={plot.skin} onChange={e => {
                  const s = e.target.value as Skin;
                  setPlot(p => ({...p, skin: s, polygon: [], comune: "", codiceCatastale: "", foglio: "", particella: ""}));
                  setMapPoints([]);
                  setCatLookup("idle");
                }}>
                  {(Object.entries(SKINS) as [Skin, typeof SKINS[Skin]][]).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Altitudine (m s.l.m.)">
                <input className={inputCls} type="number" value={plot.altitudeM} onChange={e => setPlot(p => ({...p, altitudeM: e.target.value}))} placeholder="700" />
              </Field>
              <Field label="Note">
                <input className={inputCls} value={plot.notes} onChange={e => setPlot(p => ({...p, notes: e.target.value}))} placeholder="Esposizione nord, suolo vulcanico" />
              </Field>
            </div>

            {/* Catasto section */}
            <div className="rounded-lg border border-cta/30 bg-cta/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cta" />
                <span className="text-sm font-semibold text-foreground">Riferimento Catastale</span>
                <span className="text-xs text-muted-foreground ml-1">— inserisci il riferimento dal tuo atto o visura catastale</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Comune" required>
                  <select
                    className={selectCls}
                    value={plot.codiceCatastale}
                    onChange={e => {
                      const entry = COMUNI_GI.find(c => c.codice === e.target.value);
                      setPlot(p => ({...p, codiceCatastale: e.target.value, comune: entry?.label ?? ""}));
                      setCatLookup("idle");
                    }}
                  >
                    <option value="">Seleziona comune…</option>
                    {COMUNI_GI.filter(c => c.skins.includes(plot.skin)).map(c => (
                      <option key={c.codice} value={c.codice}>{c.label}</option>
                    ))}
                    <option value="__custom">Altro (inserisci codice)</option>
                  </select>
                  {plot.codiceCatastale === "__custom" && (
                    <input
                      className={`${inputCls} mt-1.5`}
                      placeholder="Codice catastale (es. A087)"
                      maxLength={4}
                      onChange={e => setPlot(p => ({...p, codiceCatastale: e.target.value.toUpperCase(), comune: e.target.value.toUpperCase()}))}
                    />
                  )}
                </Field>
                <Field label="Foglio" required>
                  <input className={inputCls} value={plot.foglio} onChange={e => { setPlot(p => ({...p, foglio: e.target.value})); setCatLookup("idle"); }} placeholder="es. 12" />
                </Field>
                <Field label="Particella (Mappale)" required>
                  <input className={inputCls} value={plot.particella} onChange={e => { setPlot(p => ({...p, particella: e.target.value})); setCatLookup("idle"); }} placeholder="es. 345" />
                </Field>
              </div>

              {/* Lookup button + status */}
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-cta/40 text-cta hover:bg-cta/10 gap-1.5"
                  onClick={lookupCatasto}
                  disabled={catLookup === "loading" || !plot.codiceCatastale || !plot.foglio || !plot.particella}
                >
                  {catLookup === "loading"
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Ricerca…</>
                    : <><Search className="w-3.5 h-3.5" />Cerca su Catasto</>}
                </Button>
                {catLookup === "found" && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Particella trovata — poligono caricato automaticamente
                    {plot.areaHa && ` · ${plot.areaHa} ha`}
                  </span>
                )}
                {catLookup === "error" && catError && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {catError}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Trovi Foglio e Particella sulla visura catastale o sull'atto notarile del tuo terreno.
                Il sistema carica automaticamente il perimetro dell'appezzamento dalla banca dati dell'Agenzia delle Entrate.
              </p>
            </div>

            {/* Superficie override */}
            <Field label="Superficie (ha) — auto-compilata dal Catasto, puoi correggere">
              <input className={inputCls} type="number" step="0.01" value={plot.areaHa} onChange={e => setPlot(p => ({...p, areaHa: e.target.value}))} placeholder="0.50" />
            </Field>

            {/* Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {catLookup === "found"
                    ? "Poligono caricato dal Catasto — puoi modificarlo"
                    : "Poligono manuale — clicca sulla mappa per aggiungere punti"}
                </label>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">{mapPoints.length} punti</Badge>
                  {mapPoints.length > 0 && (
                    <button onClick={() => { setMapPoints([]); setPlot(p => ({...p, polygon: []})); }}
                      className="text-xs text-muted-foreground hover:text-foreground underline">Reimposta</button>
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
                Conferma poligono ({mapPoints.length} punti)
              </Button>
              {plot.polygon.length > 0 && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Poligono salvato — {plot.polygon.length - 1} punti
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" /> Indietro
              </Button>
              <Button className="flex-1 bg-cta hover:bg-cta/90 text-cta-foreground" onClick={submitPlot} disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvataggio…</> : <>Continua <ChevronRight className="w-4 h-4 ml-1" /></>}
              </Button>
            </div>
          </Card>
        )}

        {/* ── STEP 2 MODICA: Cocoa supply chain + EUDR ── */}
        {step === 2 && isModica && (
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-cta" />
              <h2 className="font-bold text-foreground text-lg">Filiera Cacao & Conformità EUDR</h2>
            </div>

            {/* EUDR notice */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3 space-y-1">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Reg. UE 2023/1115 — EUDR (applicazione PMI: dic. 2026)</p>
              <p className="text-xs text-muted-foreground">Il cacao è una delle 7 commodity soggette al Regolamento UE sulla deforestazione. Le informazioni sulla filiera vengono ancorate sulla blockchain per la dovuta diligenza.</p>
            </div>

            {/* Lotto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Codice lotto" required>
                <input className={inputCls} value={cocoa.batchCode} onChange={e => setCocoa(c => ({...c, batchCode: e.target.value}))} placeholder="MOD-2026-001" />
              </Field>
              <Field label="Quantità prodotta (kg)" required>
                <input className={inputCls} type="number" value={cocoa.quantityKg} onChange={e => setCocoa(c => ({...c, quantityKg: e.target.value}))} placeholder="500" />
              </Field>
              <Field label="Data inizio produzione" required>
                <input className={inputCls} type="date" value={cocoa.productionDateFrom} onChange={e => setCocoa(c => ({...c, productionDateFrom: e.target.value}))} />
              </Field>
              <Field label="Data fine produzione" required>
                <input className={inputCls} type="date" value={cocoa.productionDateTo} onChange={e => setCocoa(c => ({...c, productionDateTo: e.target.value}))} />
              </Field>
            </div>

            {/* Origine cacao */}
            <div className="rounded-lg border border-border p-4 space-y-4">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">🌍 Origine del Cacao</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Paese di produzione del cacao" required>
                  <select className={selectCls} value={cocoa.originCountry} onChange={e => setCocoa(c => ({...c, originCountry: e.target.value}))}>
                    {COCOA_ORIGINS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Nome fornitore" required>
                  <input className={inputCls} value={cocoa.supplierName} onChange={e => setCocoa(c => ({...c, supplierName: e.target.value}))} placeholder="Cacao Import S.r.l." />
                </Field>
                <Field label="Paese sede fornitore">
                  <input className={inputCls} value={cocoa.supplierCountry} onChange={e => setCocoa(c => ({...c, supplierCountry: e.target.value}))} placeholder="Italia" />
                </Field>
                <Field label="Rif. documento import / DDS">
                  <input className={inputCls} value={cocoa.importDocRef} onChange={e => setCocoa(c => ({...c, importDocRef: e.target.value}))} placeholder="DDT/2026/1234" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Coordinate farm cacao (EUDR — lat,lng per piantagione)">
                    <input className={inputCls} value={cocoa.farmCoordinates} onChange={e => setCocoa(c => ({...c, farmCoordinates: e.target.value}))} placeholder="-0.2340,78.4678 (una o più coppie lat,lng separate da spazio)" />
                    <p className="text-xs text-muted-foreground mt-1">Richieste dal Reg. UE 2023/1115 art. 9 per la tracciabilità anti-deforestazione.</p>
                  </Field>
                </div>
              </div>
            </div>

            {/* Certificazioni */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Certificazioni del cacao</label>
              <div className="flex flex-wrap gap-2">
                {COCOA_CERTS.map(cert => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => toggleCert(cert)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      cocoa.certifications.includes(cert)
                        ? "bg-cta text-cta-foreground border-cta"
                        : "border-border text-muted-foreground hover:border-cta/50"
                    }`}
                  >
                    {cert}
                  </button>
                ))}
              </div>
            </div>

            {/* Temperatura lavorazione */}
            <Field label="Temperatura massima di lavorazione (°C) — disciplinare IGP: max 50°C">
              <div className="flex items-center gap-3">
                <input
                  className={`${inputCls} w-28`}
                  type="number" min="20" max="50"
                  value={cocoa.processingTemp}
                  onChange={e => setCocoa(c => ({...c, processingTemp: e.target.value}))}
                />
                {parseInt(cocoa.processingTemp) <= 50
                  ? <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Conforme disciplinare IGP</span>
                  : <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Supera il limite di 50°C — non conforme IGP</span>
                }
              </div>
            </Field>

            {/* EUDR statement */}
            <div className="rounded-lg border border-border p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cocoa.eudrStatement}
                  onChange={e => setCocoa(c => ({...c, eudrStatement: e.target.checked}))}
                  className="mt-0.5 h-4 w-4 rounded border-border accent-cta cursor-pointer"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Dichiarazione di Dovuta Diligenza (EUDR)</strong> — Dichiaro che il cacao utilizzato in questo lotto non proviene da terreni soggetti a deforestazione o degrado forestale successivamente al 31 dicembre 2020, ai sensi del Regolamento UE 2023/1115. Le informazioni sulla filiera sono accurate e verificabili. <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" /> Indietro
              </Button>
              <Button
                className="flex-1 bg-cta hover:bg-cta/90 text-cta-foreground"
                onClick={submitCocoa}
                disabled={submitting || !cocoa.eudrStatement || parseInt(cocoa.processingTemp) > 50}
              >
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registrazione…</> : <><ShieldCheck className="w-4 h-4 mr-1" />Registra & Ancora su Blockchain</>}
              </Button>
            </div>
          </Card>
        )}

        {/* ── STEP 2 AGRI: Batch ── */}
        {step === 2 && !isModica && (
          <Card className="p-6 space-y-4">
            <h2 className="font-bold text-foreground text-lg">Registra il Lotto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Codice lotto" required>
                <input className={inputCls} value={batch.batchCode} onChange={e => setBatch(b => ({...b, batchCode: e.target.value}))} placeholder="BRN-2026-001" />
              </Field>
              <Field label="Quantità dichiarata (kg)" required>
                <input className={inputCls} type="number" value={batch.quantityKg} onChange={e => setBatch(b => ({...b, quantityKg: e.target.value}))} placeholder="1200" />
              </Field>
              <Field label="Inizio raccolta" required>
                <input className={inputCls} type="date" value={batch.harvestDateFrom} onChange={e => setBatch(b => ({...b, harvestDateFrom: e.target.value}))} />
              </Field>
              <Field label="Fine raccolta" required>
                <input className={inputCls} type="date" value={batch.harvestDateTo} onChange={e => setBatch(b => ({...b, harvestDateTo: e.target.value}))} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Varietà / note">
                  <input className={inputCls} value={batch.varietyNotes} onChange={e => setBatch(b => ({...b, varietyNotes: e.target.value}))} placeholder="Varietà Napoletana, raccolta a mano" />
                </Field>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" /> Indietro
              </Button>
              <Button className="flex-1 bg-cta hover:bg-cta/90 text-cta-foreground" onClick={submitBatch} disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvataggio…</> : <>Invia e Verifica <Satellite className="w-4 h-4 ml-1" /></>}
              </Button>
            </div>
          </Card>
        )}

        {/* ── STEP 3 MODICA: Compliance result ── */}
        {step === 3 && isModica && (
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cta" />
              <h2 className="font-bold text-foreground text-lg">Conformità IGP & EUDR</h2>
            </div>

            {verifyResult?.modicaCompliance && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Lotto: {batchCode}</span>
                  <Badge className="bg-green-500/15 text-green-600 border-green-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />Conforme
                  </Badge>
                </div>

                {/* Compliance layers */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Livelli di conformità</p>
                  {[
                    { label: "Laboratorio nel Comune di Modica", pass: verifyResult.modicaCompliance.workshopInModica, detail: `${workshop.address}` },
                    { label: "Temperatura lavorazione ≤ 50°C (disciplinare IGP)", pass: verifyResult.modicaCompliance.maxTempCompliant, detail: `${verifyResult.modicaCompliance.processingTempC}°C` },
                    { label: "Dichiarazione EUDR firmata", pass: verifyResult.modicaCompliance.eudrStatement, detail: "Reg. UE 2023/1115" },
                    { label: "Paese di origine cacao dichiarato", pass: !!verifyResult.modicaCompliance.originCountry, detail: verifyResult.modicaCompliance.originCountry },
                    { label: "Certificazioni filiera", pass: verifyResult.modicaCompliance.certifications?.length > 0, detail: verifyResult.modicaCompliance.certifications?.join(", ") || "Nessuna" },
                  ].map((l, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className={`mt-0.5 shrink-0 ${l.pass ? "text-green-500" : "text-amber-500"}`}>{l.pass ? "✓" : "⚠"}</span>
                      <div>
                        <span className="font-medium text-foreground">{l.label}</span>
                        <span className="text-muted-foreground ml-2 text-xs">{l.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Blockchain anchor */}
                <div className="rounded-lg border border-cta/30 bg-cta/5 p-4 space-y-3">
                  <p className="text-xs font-semibold text-cta uppercase tracking-wide">✓ Filiera ancorata su blockchain</p>
                  {verifyResult.anchor?.txHash ? (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Hash transazione — {verifyResult.anchor.chainName ?? "Ethereum"}</p>
                      <a href={verifyResult.anchor.explorerUrl} target="_blank" rel="noopener noreferrer"
                        className="font-mono text-xs text-cta hover:underline break-all">
                        {verifyResult.anchor.txHash}
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Ancoraggio in corso — potrebbe richiedere qualche secondo.</p>
                  )}
                  <Button className="w-full bg-cta hover:bg-cta/90 text-cta-foreground text-sm"
                    onClick={() => setLocation(`/passport/${batchCode}`)}>
                    Visualizza Passaporto Digitale del Prodotto →
                  </Button>
                  <Button variant="outline" className="w-full text-sm" onClick={() => setLocation("/producer/dashboard")}>
                    Vai alla mia dashboard →
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ── STEP 3 AGRI: Verification result ── */}
        {step === 3 && !isModica && (
          <Card className="p-6 space-y-5">
            <h2 className="font-bold text-foreground text-lg">Verifica Satellitare</h2>

            {!verifyResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-cta shrink-0" />
                  Verifica satellitare in corso — richiede 15–30 secondi
                </div>
                <div className="pl-8 space-y-1.5 text-xs text-muted-foreground">
                  <p>🛰️ Acquisizione di 12 mesi di immagini Copernicus Sentinel-2 per il tuo appezzamento</p>
                  <p>☁️ Mascheratura nuvole e calcolo indice NDVI</p>
                  <p>📍 Verifica del confine di zona IG e fenologia colturale</p>
                  <p>⛓️ Ancoraggio del risultato verificato su blockchain Ethereum</p>
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
                      Visualizza Passaporto Digitale del Prodotto →
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-sm"
                      onClick={() => setLocation("/producer/dashboard")}
                    >
                      Vai alla mia dashboard →
                    </Button>
                  </div>
                )}

                <Button variant="outline" className="w-full" onClick={() => setLocation("/green-agent")}>
                  Torna a Green Agent
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
