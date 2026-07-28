import { useEffect, useState, useRef } from "react";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Leaf, ExternalLink, QrCode, AlertTriangle, Info } from "lucide-react";
import QRCode from "qrcode";

// ── i18n ─────────────────────────────────────────────────────────────────────

type Lang = "en" | "it";

const T: Record<Lang, Record<string, string>> = {
  en: {
    title: "Digital Product Passport",
    subtitle: "VirtusGreen · Provenance Verification",
    verified: "Verified",
    notVerified: "Not verified",
    batchCode: "Batch code",
    quantity: "Quantity",
    harvest: "Harvest",
    producer: "Producer",
    plot: "Plot",
    region: "Region",
    provenance: "Provenance Verification",
    blockchain: "Blockchain Anchor",
    network: "Network",
    anchoredAt: "Anchored at",
    txHash: "Transaction hash",
    dpp: "Digital Product Passport",
    scanQr: "Scan to verify provenance. This page is the official Digital Product Passport for",
    espr: "EU ESPR · DPP v1.0",
    disclaimer: "Disclaimer",
    disclaimerText: "This verification report is an automated risk screening tool based on Copernicus Sentinel-2 satellite remote sensing. It provides supporting evidence for GI compliance but does not constitute legal certification under EU Regulation 2024/1143. Final GI certification remains the responsibility of accredited conformity assessment bodies (CSQA, DNV, Bureau Veritas).",
    dataQuality: "Satellite Data Quality",
    validMonths: "valid months",
    cloudContaminated: "cloud-contaminated",
    baselineAnomalies: "Year-over-year anomalies",
    noAnomalies: "No significant anomalies vs 3-year NDVI baseline.",
    layer_zone: "GI Zone Boundary",
    layer_ndvi: "Satellite NDVI Signal",
    layer_phenology: "Crop Phenology Match",
    layer_plausibility: "Area-Yield Plausibility",
    notFound: "Batch not found",
    regulation: "Regulation",
    origin: "Origin",
  },
  it: {
    title: "Passaporto Digitale del Prodotto",
    subtitle: "VirtusGreen · Verifica di Provenienza",
    verified: "Verificato",
    notVerified: "Non verificato",
    batchCode: "Codice lotto",
    quantity: "Quantità",
    harvest: "Raccolta",
    producer: "Produttore",
    plot: "Appezzamento",
    region: "Regione",
    provenance: "Verifica di Provenienza",
    blockchain: "Ancoraggio Blockchain",
    network: "Rete",
    anchoredAt: "Ancorato il",
    txHash: "Hash transazione",
    dpp: "Passaporto Digitale del Prodotto",
    scanQr: "Scansiona per verificare la provenienza. Questa pagina è il DPP ufficiale per",
    espr: "EU ESPR · DPP v1.0",
    disclaimer: "Avvertenza legale",
    disclaimerText: "Questo rapporto di verifica è uno strumento di screening automatizzato basato su telerilevamento satellitare Copernicus Sentinel-2. Fornisce prove a supporto della conformità IGP/DOP/DOC ma non costituisce certificazione legale ai sensi del Reg. UE 2024/1143. La certificazione GI finale rimane di competenza degli organismi di valutazione della conformità accreditati (CSQA, DNV, Bureau Veritas).",
    dataQuality: "Qualità Dati Satellitari",
    validMonths: "mesi validi",
    cloudContaminated: "contaminati da nuvole",
    baselineAnomalies: "Anomalie anno su anno",
    noAnomalies: "Nessuna anomalia significativa rispetto alla linea di base NDVI a 3 anni.",
    layer_zone: "Confine Zona GI",
    layer_ndvi: "Segnale NDVI Satellitare",
    layer_phenology: "Corrispondenza Fenologia",
    layer_plausibility: "Plausibilità Resa-Area",
    notFound: "Lotto non trovato",
    regulation: "Regolamentazione",
    origin: "Origine",
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface DataQuality {
  totalIntervals: number;
  validIntervals: number;
  cloudContaminatedIntervals: number;
  coveragePercent: number;
  dataQualityLabel: "excellent" | "good" | "fair" | "poor";
  notes: string[];
}

interface BatchData {
  batchCode: string;
  skin: string;
  harvestDateFrom: string;
  harvestDateTo: string;
  quantityKg: string | null;
  varietyNotes: string | null;
  verificationStatus: string;
  ndviAvg: string | null;
  ndviConfidence: number | null;
  txHash: string | null;
  chainId: number | null;
  anchoredAt: string | null;
  verifiedAt: string | null;
  verificationDetails: {
    ndvi: { avgNdvi: number; threshold: number; pass: boolean };
    zone: { insideZone: boolean; zoneName?: string; distanceKm?: number };
    phenology: { score: number; profile: string; cropMatch: boolean; mismatches: string[] };
    plausibility: { plausible: boolean; plotAreaHa: number; maxRealisticKg: number; flags: string[] };
    dataQuality?: DataQuality;
    baseline?: { anomalies: string[] };
    disclaimer?: string;
    layers: { ndviPass: boolean; zonePass: boolean; phenologyPass: boolean; plausibilityPass: boolean };
  } | null;
  producerName?: string;
  farmName?: string;
  plotName?: string;
  region?: string;
}

// ── Skin config ───────────────────────────────────────────────────────────────

const SKIN_CONFIG: Record<string, {
  label: Record<Lang, string>;
  icon: string;
  regulation: Record<Lang, string>;
  origin: Record<Lang, string>;
}> = {
  bronte: {
    label: { en: "Pistacchio di Bronte DOP", it: "Pistacchio di Bronte DOP" },
    icon: "🌿",
    regulation: { en: "EU Reg. 2024/1143 — DOP", it: "Reg. UE 2024/1143 — DOP" },
    origin: { en: "Bronte (CT), Sicily, Italy", it: "Bronte (CT), Sicilia, Italia" },
  },
  etna: {
    label: { en: "Etna DOC", it: "Etna DOC" },
    icon: "🍷",
    regulation: { en: "EU Reg. 2024/1143 — DOC", it: "Reg. UE 2024/1143 — DOC" },
    origin: { en: "Etna (CT), Sicily, Italy", it: "Etna (CT), Sicilia, Italia" },
  },
  modica: {
    label: { en: "Cioccolato di Modica IGP", it: "Cioccolato di Modica IGP" },
    icon: "🍫",
    regulation: { en: "EU Reg. 2024/1143 — IGP / EUDR 2023/1115", it: "Reg. UE 2024/1143 — IGP / EUDR 2023/1115" },
    origin: { en: "Modica (RG), Sicily, Italy", it: "Modica (RG), Sicilia, Italia" },
  },
  yubari: {
    label: { en: "Yubari King Melon GI", it: "Yubari King Melon GI" },
    icon: "🍈",
    regulation: { en: "Japan GI — MAFF 2015 / EU-Japan EPA", it: "GI Giappone — MAFF 2015 / EPA UE-Giappone" },
    origin: { en: "Yubari, Hokkaido, Japan", it: "Yubari, Hokkaido, Giappone" },
  },
};

const QUALITY_COLORS: Record<DataQuality["dataQualityLabel"], string> = {
  excellent: "text-green-600 bg-green-500/10 border-green-500/30",
  good:      "text-blue-600 bg-blue-500/10 border-blue-500/30",
  fair:      "text-amber-600 bg-amber-500/10 border-amber-500/30",
  poor:      "text-red-600 bg-red-500/10 border-red-500/30",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function BatchPassport() {
  const params = useParams<{ batchCode: string }>();
  const batchCode = params.batchCode;
  const [batch, setBatch] = useState<BatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const t = (key: string) => T[lang][key] ?? key;

  useEffect(() => {
    if (!batchCode) return;
    fetch(`/api/batches/${batchCode}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(data => { setBatch(data); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, [batchCode]);

  useEffect(() => {
    if (!batch || !qrCanvasRef.current) return;
    const url = `${window.location.origin}/passport/${batch.batchCode}`;
    QRCode.toCanvas(qrCanvasRef.current, url, { width: 160, margin: 2 });
  }, [batch]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-cta" />
    </div>
  );

  if (error || !batch) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-8 max-w-md text-center space-y-3">
        <XCircle className="w-10 h-10 text-destructive mx-auto" />
        <p className="font-semibold text-foreground">{t("notFound")}</p>
        <p className="text-sm text-muted-foreground">{batchCode}</p>
      </Card>
    </div>
  );

  const skin = SKIN_CONFIG[batch.skin];
  const verified = batch.verificationStatus === "verified";
  const d = batch.verificationDetails;
  const dq = d?.dataQuality;
  const anomalies = d?.baseline?.anomalies ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-cta" />
            <span className="font-bold text-sm">VirtusGreen · {t("title")}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang("en")}
              className={`text-xs px-2 py-1 rounded ${lang === "en" ? "bg-cta text-white" : "text-muted-foreground hover:text-foreground"}`}
            >EN</button>
            <button
              onClick={() => setLang("it")}
              className={`text-xs px-2 py-1 rounded ${lang === "it" ? "bg-cta text-white" : "text-muted-foreground hover:text-foreground"}`}
            >IT</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Hero */}
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{skin?.icon ?? "📦"}</span>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{skin?.label[lang] ?? batch.skin}</h1>
                  <p className="text-sm text-muted-foreground">{skin?.origin[lang]}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-1">{skin?.regulation[lang]}</p>
            </div>
            <Badge className={verified
              ? "bg-green-500/15 text-green-600 border-green-500/30 shrink-0"
              : "bg-red-500/15 text-red-600 border-red-500/30 shrink-0"}>
              {verified ? <><CheckCircle2 className="w-3 h-3 mr-1" />{t("verified")}</> : t("notVerified")}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-border text-sm">
            <div><p className="text-xs text-muted-foreground">{t("batchCode")}</p><p className="font-mono font-semibold">{batch.batchCode}</p></div>
            {batch.quantityKg && <div><p className="text-xs text-muted-foreground">{t("quantity")}</p><p className="font-semibold">{parseFloat(batch.quantityKg).toLocaleString()} kg</p></div>}
            <div><p className="text-xs text-muted-foreground">{t("harvest")}</p><p className="font-semibold text-xs">{batch.harvestDateFrom} → {batch.harvestDateTo}</p></div>
            {batch.farmName && <div><p className="text-xs text-muted-foreground">{t("producer")}</p><p className="font-semibold">{batch.farmName}</p></div>}
            {batch.plotName && <div><p className="text-xs text-muted-foreground">{t("plot")}</p><p className="font-semibold">{batch.plotName}</p></div>}
            {batch.region && <div><p className="text-xs text-muted-foreground">{t("region")}</p><p className="font-semibold">{batch.region}</p></div>}
          </div>
        </Card>

        {/* Satellite Data Quality */}
        {dq && (
          <Card className="p-6 space-y-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{t("dataQuality")}</h2>
            <div className="flex items-center gap-3">
              <Badge className={`border ${QUALITY_COLORS[dq.dataQualityLabel]} text-xs capitalize`}>
                {dq.dataQualityLabel}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {dq.validIntervals}/{dq.totalIntervals} {t("validMonths")}
                {dq.cloudContaminatedIntervals > 0 && ` · ${dq.cloudContaminatedIntervals} ${t("cloudContaminated")}`}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="h-2 rounded-full bg-cta transition-all" style={{ width: `${dq.coveragePercent}%` }} />
            </div>
            {dq.notes.length > 0 && (
              <ul className="space-y-1">
                {dq.notes.map((n, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5"><Info className="w-3 h-3 mt-0.5 shrink-0 text-cta" />{n}</li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {/* 3-year baseline anomalies */}
        {anomalies.length > 0 && (
          <Card className="p-6 space-y-3 border-amber-500/30">
            <h2 className="text-sm font-bold text-amber-600 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />{t("baselineAnomalies")}
            </h2>
            <ul className="space-y-1">
              {anomalies.map((a, i) => (
                <li key={i} className="text-xs text-muted-foreground">{a}</li>
              ))}
            </ul>
          </Card>
        )}
        {d && anomalies.length === 0 && (
          <Card className="p-4 border-green-500/20 bg-green-500/5">
            <p className="text-xs text-green-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 shrink-0" />{t("noAnomalies")}
            </p>
          </Card>
        )}

        {/* Verification layers */}
        {d && (
          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{t("provenance")}</h2>
            <div className="space-y-3">
              {[
                { label: t("layer_zone"),        pass: d.layers.zonePass,         detail: d.zone.insideZone ? `Inside ${d.zone.zoneName ?? "GI zone"}` : `Outside zone — ${d.zone.distanceKm} km away` },
                { label: t("layer_ndvi"),        pass: d.layers.ndviPass,         detail: `Avg NDVI ${d.ndvi.avgNdvi} · threshold ${d.ndvi.threshold}` },
                { label: t("layer_phenology"),   pass: d.layers.phenologyPass,    detail: `Score ${d.phenology.score}/100 · ${d.phenology.profile}` },
                { label: t("layer_plausibility"),pass: d.layers.plausibilityPass, detail: d.plausibility.flags[0] ?? `${d.plausibility.plotAreaHa.toFixed(2)} ha · max ${d.plausibility.maxRealisticKg.toLocaleString()} kg` },
              ].map((l, i) => (
                <div key={i} className="flex items-start gap-3">
                  {l.pass
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    : <XCircle     className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-foreground">{l.label}</span>
                    <p className="text-xs text-muted-foreground">{l.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            {batch.verifiedAt && (
              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                {lang === "it" ? "Verificato il" : "Verified at"} {new Date(batch.verifiedAt).toLocaleString(lang === "it" ? "it-IT" : "en-GB")}
              </p>
            )}
          </Card>
        )}

        {/* On-chain anchor */}
        {batch.txHash && (
          <Card className="p-6 space-y-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{t("blockchain")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground">{t("network")}</p><p className="font-semibold">Ethereum Sepolia</p></div>
              <div><p className="text-xs text-muted-foreground">{t("anchoredAt")}</p><p className="font-semibold text-xs">{batch.anchoredAt ? new Date(batch.anchoredAt).toLocaleString(lang === "it" ? "it-IT" : "en-GB") : "—"}</p></div>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">{t("txHash")}</p>
                <a href={`https://sepolia.etherscan.io/tx/${batch.txHash}`} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-xs text-cta hover:underline flex items-center gap-1 break-all">
                  {batch.txHash}<ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>
          </Card>
        )}

        {/* QR + DPP */}
        <Card className="p-6">
          <div className="flex items-start gap-6">
            <div className="space-y-2 flex-1">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <QrCode className="w-4 h-4" /> {t("dpp")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("scanQr")} {batch.batchCode}.
              </p>
              <Badge variant="outline" className="text-xs">{t("espr")}</Badge>
            </div>
            <canvas ref={qrCanvasRef} className="rounded-lg border border-border shrink-0" />
          </div>
        </Card>

        {/* Legal disclaimer */}
        <Card className="p-4 border-slate-200 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("disclaimer")}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{t("disclaimerText")}</p>
            </div>
          </div>
        </Card>

      </main>

      <footer className="border-t border-border mt-8">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>VirtusGreen · Green Agent</span>
          <span>EU Reg. 2024/1143 · EUDR 2023/1115 · ESPR DPP</span>
        </div>
      </footer>
    </div>
  );
}
