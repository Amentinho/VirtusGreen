import { useState } from "react";
import { ArrowRight, FileCheck, Globe, Satellite } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const REASONS = [
  { icon: <Satellite className="w-4 h-4" />, text: "EUDR compliance checklist for cocoa & coffee importers" },
  { icon: <FileCheck className="w-4 h-4" />, text: "GI digital traceability guide (EU Reg 2024/1143)" },
  { icon: <Globe className="w-4 h-4" />, text: "Early access to new GI zones as we expand across Italy" },
];

export default function LeadCapture() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !role) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    try {
      // Reuse the contact form endpoint with projectType = "User"
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: role,
          email,
          projectType: "User",
          message: `Early access request. Role: ${role}`,
        }),
      });
      trackEvent("lead_capture_submit", "conversion", role);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="early-access"
      className="py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #021c1b 0%, #043231 60%, #062e2c 100%)" }}
    >
      {/* radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 70% at 80% 50%, rgba(192,250,121,0.06) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — value prop */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-[#c0fa79] bg-[#c0fa79]/10 border border-[#c0fa79]/20 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c0fa79] animate-pulse" />
              Free resources
            </span>
            <h2
              className="text-4xl lg:text-5xl font-light text-white leading-[1.1]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Stay ahead of<br />
              <em className="not-italic" style={{ color: "#c0fa79" }}>EU food law.</em>
            </h2>
            <p className="text-white/55 text-base leading-relaxed max-w-sm">
              Join GI producers and consortium managers getting early access, regulatory updates, and free compliance resources.
            </p>
            <ul className="space-y-3">
              {REASONS.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                  <span className="mt-0.5 flex-none text-[#c0fa79]">{r.icon}</span>
                  {r.text}
                </li>
              ))}
            </ul>
            <p className="text-xs text-white/25">No spam. Unsubscribe any time. GDPR compliant.</p>
          </div>

          {/* Right — form */}
          <div
            className="rounded-2xl p-8"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
          >
            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto text-2xl"
                  style={{ background: "rgba(192,250,121,0.15)" }}
                >
                  ✓
                </div>
                <h3 className="text-xl font-semibold text-white">You're on the list.</h3>
                <p className="text-white/50 text-sm">We'll be in touch with your free EUDR checklist within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Your role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c0fa79]/40"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: role ? "#fff" : "rgba(255,255,255,0.35)" }}
                  >
                    <option value="" disabled>Select your role…</option>
                    <option value="GI Producer">GI Producer (DOP / DOC / IGP)</option>
                    <option value="GI Consortium">GI Consortium / Consorzio</option>
                    <option value="Certifier / Inspection Body">Certifier / Inspection Body</option>
                    <option value="Cocoa / Coffee Importer">Cocoa / Coffee Importer (EUDR)</option>
                    <option value="Retailer / Distributor">Retailer / Distributor</option>
                    <option value="Investor / Advisor">Investor / Advisor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Work email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c0fa79]/40"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
                  />
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold transition-opacity disabled:opacity-60"
                  style={{ background: "#c0fa79", color: "#043231" }}
                >
                  {loading ? "Sending…" : "Get free resources"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
                <p className="text-center text-xs text-white/25">
                  By submitting you agree to our{" "}
                  <a href="/privacy" className="underline hover:text-white/50">Privacy Policy</a>.
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
