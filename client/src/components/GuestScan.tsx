import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, QrCode, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const DEMO_CODES = [
  { code: "BRN-2026-001", label: "Pistacchio Verde di Bronte DOP" },
  { code: "ETN-2026-001", label: "Vino Etna DOC" },
  { code: "MOD-2026-001", label: "Cioccolato di Modica IGP" },
];

export default function GuestScan() {
  const [, setLocation] = useLocation();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const go = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) { setError("Enter a batch code to continue."); return; }
    setError("");
    trackEvent("guest_scan", "passport", clean);
    setLocation(`/passport/${clean}`);
  };

  return (
    <section
      id="scan"
      className="py-24 px-6"
      style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, #021c1b 100%)" }}
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* eyebrow */}
        <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-[#c0fa79] bg-[#c0fa79]/10 border border-[#c0fa79]/20 rounded-full px-4 py-1.5 mb-6">
          <QrCode className="w-3 h-3" />
          Try it now — no account needed
        </span>

        <h2
          className="text-3xl sm:text-4xl font-light text-white mb-4 leading-tight"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Scan a product,<br />
          <em className="not-italic" style={{ color: "#c0fa79" }}>see the truth.</em>
        </h2>
        <p className="text-white/55 text-base mb-10 leading-relaxed max-w-md mx-auto">
          Enter a VirtusGreen batch code or tap a demo product below to see its full Digital Product Passport — satellite-verified, blockchain-anchored.
        </p>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); go(input); }}
          className="flex gap-2 max-w-md mx-auto mb-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            placeholder="e.g. BRN-2026-001"
            className="flex-1 rounded-xl px-4 py-3 text-sm font-mono bg-white/8 border border-white/15 text-white placeholder:text-white/30 outline-none focus:border-[#c0fa79]/60 focus:bg-white/10 transition-colors"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-200 hover:gap-3 flex-none"
            style={{ background: "#c0fa79", color: "#043231" }}
          >
            View
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

        {/* Demo chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {DEMO_CODES.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => go(code)}
              className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 border"
              style={{
                background: "rgba(192,250,121,0.07)",
                borderColor: "rgba(192,250,121,0.2)",
                color: "rgba(255,255,255,0.65)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(192,250,121,0.14)";
                (e.currentTarget as HTMLElement).style.color = "#c0fa79";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(192,250,121,0.07)";
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
              }}
            >
              <span className="font-mono text-[10px] opacity-60">{code}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Token teaser */}
        <div className="mt-10 inline-flex items-center gap-2 text-xs text-white/35">
          <Sparkles className="w-3.5 h-3.5 text-[#c0fa79]/50" />
          Register free to earn <span className="text-[#c0fa79]/70 font-semibold">Green Tokens</span> for every sustainable choice
        </div>
      </div>
    </section>
  );
}
