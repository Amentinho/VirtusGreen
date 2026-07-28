import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Leaf, LogOut, Package, MapPin, CheckCircle2, Clock, XCircle,
  AlertTriangle, ExternalLink, Plus, ChevronRight, Loader2, User,
} from "lucide-react";
import logoImage from "@assets/logo-horizontal.png";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Producer {
  id: string; name: string; farmName: string; email: string;
  region?: string; giType?: string; certificationBody?: string;
  giCertificationNumber?: string; status: string; createdAt: string;
}

interface Batch {
  id: string; batchCode: string; skin: string;
  harvestDateFrom: string; harvestDateTo: string;
  quantityKg?: string; verificationStatus: string;
  ndviAvg?: string; ndviConfidence?: number;
  txHash?: string; anchoredAt?: string;
  dppIssued: boolean; createdAt: string;
}

interface Plot {
  id: string; name: string; skin: string;
  altitudeM?: number; areaSqm?: number;
  cadastralRef?: string; createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const SKIN_LABELS: Record<string, string> = {
  bronte: "Bronte DOP Pistachio 🌿",
  etna: "Etna DOC Wine 🍷",
  modica: "Modica IGP Chocolate 🍫",
  yubari: "Yubari Melon 🍈",
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.FC<any>; cls: string }> = {
  verified:  { label: "Verified",  icon: CheckCircle2,   cls: "bg-green-500/10 text-green-600 border-green-500/30" },
  pending:   { label: "Pending",   icon: Clock,          cls: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" },
  rejected:  { label: "Rejected",  icon: XCircle,        cls: "bg-red-500/10 text-red-600 border-red-500/30" },
  error:     { label: "Error",     icon: AlertTriangle,  cls: "bg-orange-500/10 text-orange-600 border-orange-500/30" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const CONTRACT_ADDRESS = "0x4Db52a82F5c068Cc2b11Be5009191D149315C355";

// ── Main component ────────────────────────────────────────────────────────────

export default function ProducerDashboard() {
  const [, setLocation] = useLocation();
  const [producer, setProducer] = useState<Producer | null>(null);
  const [batches, setBatches]   = useState<Batch[]>([]);
  const [plots, setPlots]       = useState<Plot[]>([]);
  const [loading, setLoading]   = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) { setLocation("/producer/login"); return; }
      const me: Producer = await meRes.json();
      setProducer(me);

      const [batchRes, plotRes] = await Promise.all([
        fetch("/api/batches?producerId=" + me.id),
        fetch("/api/plots/" + me.id),
      ]);
      if (batchRes.ok) setBatches(await batchRes.json());
      if (plotRes.ok)  setPlots(await plotRes.json());
      setLoading(false);
    })();
  }, []);

  const logout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-cta" />
      </div>
    );
  }

  const verifiedCount = batches.filter(b => b.verificationStatus === "verified").length;
  const dppCount      = batches.filter(b => b.dppIssued).length;

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => setLocation("/")} className="flex items-center">
            <img src={logoImage} alt="VirtusGreen" className="h-8 w-auto object-contain" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{producer?.email}</span>
            <button
              onClick={logout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Producer card */}
        <Card className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cta/10 flex items-center justify-center">
                <User className="w-6 h-6 text-cta" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{producer?.farmName}</h1>
                <p className="text-sm text-muted-foreground">{producer?.name} · {producer?.region ?? "—"}</p>
                {producer?.giType && (
                  <span className="text-xs font-medium text-cta">{producer.giType} · {producer.certificationBody}</span>
                )}
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">{batches.length}</div>
                <div className="text-xs text-muted-foreground">Batches</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
                <div className="text-xs text-muted-foreground">Verified</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{plots.length}</div>
                <div className="text-xs text-muted-foreground">Plots</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{dppCount}</div>
                <div className="text-xs text-muted-foreground">DPPs issued</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Batches */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-cta" /> Batches
            </h2>
            <Button
              size="sm"
              className="bg-cta hover:bg-cta/90 text-cta-foreground"
              onClick={() => setLocation("/producer/register")}
            >
              <Plus className="w-4 h-4 mr-1" /> New batch
            </Button>
          </div>

          {batches.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No batches yet</p>
              <p className="text-sm mt-1">Register your first batch to get a Digital Product Passport.</p>
              <Button className="mt-4 bg-cta hover:bg-cta/90 text-cta-foreground" onClick={() => setLocation("/producer/register")}>
                Register first batch <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {batches.map(b => (
                <Card key={b.id} className="p-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-foreground">{b.batchCode}</span>
                        <StatusBadge status={b.verificationStatus} />
                        {b.dppIssued && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-cta/10 text-cta border border-cta/20 font-medium">DPP issued</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                        <span>{SKIN_LABELS[b.skin] ?? b.skin}</span>
                        <span>Harvest: {formatDate(b.harvestDateFrom)} – {formatDate(b.harvestDateTo)}</span>
                        {b.quantityKg && <span>{b.quantityKg} kg</span>}
                        {b.ndviAvg && <span>NDVI avg: {Number(b.ndviAvg).toFixed(3)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {b.txHash && (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${b.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> Etherscan
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLocation(`/passport/${b.batchCode}`)}
                      >
                        <Leaf className="w-3.5 h-3.5 mr-1 text-cta" /> View DPP
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Plots */}
        <section className="space-y-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cta" /> Registered Plots
          </h2>

          {plots.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground text-sm">No plots registered.</Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plots.map(p => (
                <Card key={p.id} className="p-4 space-y-1">
                  <div className="font-medium text-foreground text-sm">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{SKIN_LABELS[p.skin] ?? p.skin}</div>
                  <div className="text-xs text-muted-foreground flex gap-3 flex-wrap">
                    {p.altitudeM && <span>{p.altitudeM} m a.s.l.</span>}
                    {p.areaSqm   && <span>{(p.areaSqm / 10000).toFixed(2)} ha</span>}
                    {p.cadastralRef && <span>Ref: {p.cadastralRef}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">Registered {formatDate(p.createdAt)}</div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Blockchain anchor info */}
        <Card className="p-4 border-dashed">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cta/10 flex items-center justify-center flex-shrink-0">
              <Leaf className="w-4 h-4 text-cta" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Blockchain anchor</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                All verified batches are anchored on Ethereum Sepolia via{" "}
                <a
                  href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cta underline hover:no-underline font-mono"
                >
                  GreenAgentLedger
                </a>
                .
              </p>
            </div>
          </div>
        </Card>

      </main>
    </div>
  );
}
