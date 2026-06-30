import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MapPin, Satellite, Link, QrCode,
  CheckCircle2, XCircle, Loader2, ChevronRight,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

type Skin = "bronte" | "etna" | "modica";

function recentDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 90);
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
  };
}

const SKINS: Record<Skin, { label: string; icon: string; batchPrefix: string; plotName: string }> = {
  bronte: {
    label: "Bronte DOP Pistachio",
    icon: "🌿",
    batchPrefix: "BRN",
    plotName: "Contrada Difesa, Bronte (CT)",
  },
  etna: {
    label: "Etna DOC Wine",
    icon: "🍷",
    batchPrefix: "ETN",
    plotName: "Contrada Calderara, Randazzo (CT)",
  },
  modica: {
    label: "Modica IGP Chocolate",
    icon: "🍫",
    batchPrefix: "MOD",
    plotName: "Água Izé plantation, São Tomé island",
  },
};

type Step = "idle" | "capturing" | "verifying" | "anchoring" | "done" | "failed";

interface VerifyResult {
  batchId: string;
  skin: string;
  plotName: string;
  verified: boolean;
  confidence: number;
  avgNdvi: number;
  intervals: { period: string; ndviMean: number; ndviMax: number }[];
  anchorReady: boolean;
}

const MOCK_TX = "0x4a7f...b3e9";

const STEPS = [
  { key: "capture", label: "Capture", icon: MapPin },
  { key: "verify",  label: "Verify",  icon: Satellite },
  { key: "anchor",  label: "Anchor",  icon: Link },
  { key: "prove",   label: "Prove",   icon: QrCode },
];

function stepIndex(step: Step) {
  if (step === "idle") return -1;
  if (step === "capturing") return 0;
  if (step === "verifying") return 1;
  if (step === "anchoring") return 2;
  if (step === "done" || step === "failed") return 3;
  return -1;
}

export default function BatchVerificationDemo() {
  const [skin, setSkin] = useState<Skin>("bronte");
  const [batchId, setBatchId] = useState(SKINS.bronte.batchPrefix + "-2024-001");
  const [step, setStep] = useState<Step>("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSkinChange = (s: Skin) => {
    setSkin(s);
    setBatchId(SKINS[s].batchPrefix + "-2024-001");
    setStep("idle");
    setResult(null);
    setError(null);
  };

  const isFakeBatch = (id: string) =>
    !id.match(/^(BRN|ETN|MOD)-\d{4}-\d{3,4}$/i);

  const runVerification = async () => {
    setError(null);
    setResult(null);
    trackEvent("batch_verify_start", "engagement", skin);

    setStep("capturing");
    await delay(900);

    setStep("verifying");
    try {
      const res = await fetch("/api/sentinel/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId,
          skin,
          ...recentDateRange(),
          useFakePlot: isFakeBatch(batchId),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Verification failed");
        setStep("failed");
        return;
      }

      setResult(data);

      if (!data.verified) {
        setStep("failed");
        trackEvent("batch_verify_failed", "engagement", skin);
        return;
      }

      setStep("anchoring");
      await delay(1200);

      setStep("done");
      trackEvent("batch_verify_success", "engagement", skin);
    } catch (e: any) {
      setError(e.message ?? "Network error");
      setStep("failed");
    }
  };

  const currentStepIdx = stepIndex(step);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">

      {/* Skin selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {(Object.entries(SKINS) as [Skin, typeof SKINS[Skin]][]).map(([key, s]) => (
          <button
            key={key}
            onClick={() => handleSkinChange(key)}
            disabled={step !== "idle" && step !== "done" && step !== "failed"}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              skin === key
                ? "bg-cta text-cta-foreground border-cta shadow-md shadow-cta/25"
                : "bg-card border-card-border text-muted-foreground hover:border-cta/50"
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Batch input */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Batch ID</label>
            <input
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-cta/40"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              disabled={step !== "idle" && step !== "done" && step !== "failed"}
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Plot</label>
            <div className="px-3 py-2 rounded-md border border-border bg-muted/30 text-sm text-muted-foreground">
              {result?.plotName ?? SKINS[skin].plotName}
            </div>
          </div>
        </div>

        <Button
          className="w-full bg-cta hover:bg-cta/90 text-cta-foreground"
          onClick={runVerification}
          disabled={step !== "idle" && step !== "done" && step !== "failed"}
        >
          {step === "idle" || step === "done" || step === "failed" ? (
            <>Run Verification <ChevronRight className="w-4 h-4 ml-1" /></>
          ) : (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying…</>
          )}
        </Button>
      </Card>

      {/* Step tracker */}
      {step !== "idle" && (
        <div className="flex items-center justify-between px-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === currentStepIdx && step !== "done" && step !== "failed";
            const done = i < currentStepIdx || step === "done";
            const failed = step === "failed" && i === currentStepIdx;
            return (
              <div key={s.key} className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  done ? "bg-cta border-cta text-cta-foreground"
                  : active ? "border-cta text-cta animate-pulse"
                  : failed ? "border-destructive text-destructive"
                  : "border-border text-muted-foreground"
                }`}>
                  {active ? <Loader2 className="w-4 h-4 animate-spin" />
                  : done ? <CheckCircle2 className="w-4 h-4" />
                  : failed ? <XCircle className="w-4 h-4" />
                  : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                {i < STEPS.length - 1 && (
                  <div className={`absolute hidden sm:block h-0.5 w-16 mt-4 ml-24 ${done ? "bg-cta" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Result */}
      {result && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">Verification Result</h3>
            <Badge className={result.verified ? "bg-green-500/15 text-green-600 border-green-500/30" : "bg-red-500/15 text-red-600 border-red-500/30"}>
              {result.verified ? <><CheckCircle2 className="w-3 h-3 mr-1" />Authentic</> : <><XCircle className="w-3 h-3 mr-1" />Rejected</>}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <Stat label="Batch ID" value={result.batchId} />
            <Stat label="Avg NDVI" value={result.avgNdvi.toFixed(3)} />
            <Stat label="Confidence" value={`${result.confidence}%`} />
            <Stat label="Satellite data" value={`Last 90 days · live`} />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">NDVI confidence</p>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-2 rounded-full bg-cta transition-all"
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>

          {result.intervals.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Monthly NDVI</p>
              <div className="space-y-1">
                {/* Deduplicate: keep highest NDVI per month */}
                {Object.values(
                  result.intervals.reduce<Record<string, typeof result.intervals[0]>>((acc, iv) => {
                    if (!acc[iv.period] || iv.ndviMean > acc[iv.period].ndviMean) acc[iv.period] = iv;
                    return acc;
                  }, {})
                ).map((iv) => (
                  <div key={iv.period} className="flex items-center gap-3 text-sm">
                    <span className="w-16 text-muted-foreground shrink-0">{iv.period}</span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-cta transition-all"
                        style={{ width: `${Math.max(0, Math.min(100, ((iv.ndviMean + 1) / 2) * 100))}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-muted-foreground">{iv.ndviMean.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "done" && result.verified && (
            <div className="rounded-lg border border-cta/30 bg-cta/5 p-4 space-y-2">
              <p className="text-xs font-semibold text-cta uppercase tracking-wide flex items-center gap-1.5">
                <Link className="w-3 h-3" /> On-chain anchor
              </p>
              <p className="text-xs text-muted-foreground font-mono">{MOCK_TX} · Sepolia testnet</p>
              <p className="text-xs text-muted-foreground">
                Real anchoring via ThreatLedger contract{" "}
                <code className="text-xs">0x8A208…Ba35B</code> coming in next sprint.
              </p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-cta/20">
                <QrCode className="w-8 h-8 text-cta" />
                <p className="text-xs text-muted-foreground">QR code generation ready — batch passport link will be issued here.</p>
              </div>
            </div>
          )}

          {step === "failed" && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {result.verified === false
                ? "NDVI signal below threshold — batch cannot be verified. QR will not be issued."
                : error ?? "Verification failed."}
            </div>
          )}
        </Card>
      )}

      {error && step === "failed" && !result && (
        <Card className="p-4 border-destructive/40 bg-destructive/5 text-sm text-destructive">
          {error}
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
