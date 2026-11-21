import { useEffect, useRef, useState } from "react";
import { ArrowRight, Satellite, ShieldCheck, QrCode, Globe } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useTranslation } from "react-i18next";

// Animated passport card shown in the right column
function PassportCard() {
  const [step, setStep] = useState(0);
  const [co2, setCo2] = useState(0);

  const steps = [
    { label: "Scanning product barcode", sub: "EAN-13 · 8057539210045" },
    { label: "Loading supply chain data", sub: "Origin: Bronte CT · Sicilia, IT" },
    { label: "Calculating CO₂ footprint", sub: "LCA model · verified emissions" },
    { label: "Water & energy impact", sub: "612 L/kg · 0.8 kWh transport" },
    { label: "Anchoring passport on-chain", sub: "Base mainnet · tx confirmed" },
    { label: "Passport ready", sub: "DPP-2024-0042 · Scan to verify" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => {
        if (s >= steps.length - 1) {
          setTimeout(() => { setStep(0); setCo2(0); }, 2200);
          return s;
        }
        return s + 1;
      });
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (step === 2) {
      let v = 0;
      const t = setInterval(() => {
        v += 0.4;
        setCo2(Math.min(v, 18.4));
        if (v >= 18.4) clearInterval(t);
      }, 30);
      return () => clearInterval(t);
    }
  }, [step]);

  const done = step >= steps.length - 1;

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#06201f]/90 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40">
      {/* top bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        <span className="ml-3 text-xs text-white/40 font-mono">passport · digital product</span>
      </div>

      <div className="p-5 space-y-1.5">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 py-2 px-3 rounded-lg transition-all duration-500 ${
              i === step
                ? "bg-[#c0fa79]/10 border border-[#c0fa79]/20"
                : i < step
                ? "opacity-60"
                : "opacity-20"
            }`}
          >
            <div className={`mt-0.5 w-4 h-4 rounded-full flex-none flex items-center justify-center text-[9px] font-bold transition-colors duration-300 ${
              i < step
                ? "bg-[#c0fa79] text-[#043231]"
                : i === step
                ? "bg-[#c0fa79]/30 border border-[#c0fa79]/60 animate-pulse"
                : "bg-white/10"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white/90 leading-none mb-0.5">{s.label}</p>
              <p className="text-[11px] text-white/40 font-mono truncate">
                {i === 2 && step === 2 ? `CO₂ ${co2.toFixed(1)} kg/t · scope 1-3` : s.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* result bar */}
      <div className={`px-5 pb-5 transition-all duration-700 ${done ? "opacity-100" : "opacity-0"}`}>
        <div className="rounded-xl bg-[#c0fa79]/15 border border-[#c0fa79]/30 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#c0fa79] uppercase tracking-wider mb-0.5">+12 Green Tokens earned</p>
            <p className="text-[11px] text-white/50 font-mono">EcoScore A+ · Base tx 0x9eF2…</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#c0fa79]/20 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-[#c0fa79]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Floating stat pill
function StatPill({ value, label, delay }: { value: string; label: string; delay: string }) {
  return (
    <div
      className="inline-flex flex-col items-center gap-0.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-3"
      style={{ animationDelay: delay }}
    >
      <span className="text-xl font-bold text-white leading-none">{value}</span>
      <span className="text-[11px] text-white/50 uppercase tracking-wider whitespace-nowrap">{label}</span>
    </div>
  );
}

export default function Hero() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Entrance
  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  // Subtle animated particle field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const dots: { x: number; y: number; vx: number; vy: number; r: number }[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(192,250,121,0.18)";
        ctx.fill();
      });
      // draw faint connections
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(192,250,121,${0.05 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    trackEvent("hero_cta", "navigation", id);
  };

  const badges = [
    { icon: <QrCode className="w-3.5 h-3.5" />, label: "ESPR DPP-ready" },
    { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "Blockchain-anchored" },
    { icon: <Globe className="w-3.5 h-3.5" />, label: "EU compliant" },
    { icon: <Satellite className="w-3.5 h-3.5" />, label: "Satellite-verified origin" },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #021c1b 0%, #043231 40%, #062e2c 100%)" }}
    >
      {/* particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 60% at 30% 50%, rgba(192,250,121,0.07) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left column ─────────────────────────────────────────── */}
          <div
            className={`space-y-8 transition-all duration-900 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            style={{ transitionDuration: "800ms" }}
          >
            {/* eyebrow */}
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.18em] uppercase text-[#c0fa79] bg-[#c0fa79]/10 border border-[#c0fa79]/20 rounded-full px-4 py-1.5">
                <QrCode className="w-3 h-3" />
                Digital Product Passport · Blockchain · Loyalty
              </span>
            </div>

            {/* headline — Fraunces display */}
            <div className="space-y-3">
              <h1
                className="text-5xl sm:text-6xl lg:text-[4.25rem] leading-[1.05] font-light text-white"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Know what&apos;s in<br />
                <em className="not-italic text-[#c0fa79]">your food.</em><br />
                Earn for going green.
              </h1>
              <p className="text-lg text-white/60 max-w-lg leading-relaxed font-light" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                Scan any VirtusGreen barcode to see the verified environmental story behind your food — CO₂, water, energy — and earn tokens for every sustainable choice.
              </p>
            </div>

            {/* badges */}
            <div className="flex flex-wrap gap-2">
              {badges.map((r, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/60 bg-white/5 border border-white/10 rounded-full px-3 py-1.5"
                >
                  {r.icon}
                  {r.label}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="https://virtusgreen.onrender.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-bold transition-all duration-200 hover:gap-4"
                style={{ background: "#c0fa79", color: "#043231" }}
                data-testid="button-hero-primary"
              >
                Open App
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
              <button
                onClick={() => scrollTo("how-it-works")}
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white/80 border border-white/15 hover:bg-white/5 transition-all duration-200"
                data-testid="button-hero-secondary"
              >
                How it works
              </button>
            </div>

            {/* stats */}
            <div className="flex flex-wrap gap-3 pt-2">
              <StatPill value="120+" label="Products tracked" delay="0ms" />
              <StatPill value="450kg" label="CO₂ saved" delay="100ms" />
              <StatPill value="35+" label="Producers" delay="200ms" />
            </div>
          </div>

          {/* ── Right column: animated passport card ─────────────── */}
          <div
            className={`transition-all duration-900 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDuration: "900ms", transitionDelay: "200ms" }}
          >
            <PassportCard />
          </div>

        </div>
      </div>

      {/* bottom fade to site bg */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--background)))" }}
      />
    </section>
  );
}
