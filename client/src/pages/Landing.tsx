import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowRight, Satellite, ShieldCheck } from "lucide-react";
import logoImage from "@assets/logo-horizontal.png";
import LanguageSelector from "@/components/LanguageSelector";
import { trackEvent } from "@/lib/analytics";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  const go = (path: string, label: string) => {
    trackEvent("product_select", "navigation", label);
    setLocation(path);
  };

  const cards = [
    {
      path: "/passport",
      label: "passport",
      icon: <ShieldCheck className="w-6 h-6" />,
      eyebrow: t("landing.passportLabel", "Consumer product"),
      title: t("landing.passportTitle", "Passport"),
      subtitle: t("landing.passportSubtitle", "Digital Product Passport"),
      desc: t("landing.passportDesc", "Scan a product barcode, see its verified environmental story — CO₂, water, energy — and earn tokens for sustainable choices."),
      features: t("landing.passportFeatures", { returnObjects: true }) as string[],
      cta: t("landing.passportCta", "Explore Passport"),
      accentFrom: "#4ade80",
      accentTo: "#22d3ee",
    },
    {
      path: "/green-agent",
      label: "green-agent",
      icon: <Satellite className="w-6 h-6" />,
      eyebrow: t("landing.agentLabel", "GI producers & consortia"),
      title: t("landing.agentTitle", "Green Agent"),
      subtitle: t("landing.agentSubtitle", "Provenance · EUDR · E-label"),
      desc: t("landing.agentDesc", "Satellite NDVI verification + blockchain DPP for DOP, DOC and IGP producers. Automated evidence for EU Reg 2024/1143 and EUDR 2023/1115."),
      features: t("landing.agentFeatures", { returnObjects: true }) as string[],
      cta: t("landing.agentCta", "Explore Green Agent"),
      accentFrom: "#c0fa79",
      accentTo: "#4ade80",
      badge: t("landing.newBadge", "New"),
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(145deg, #021c1b 0%, #043231 55%, #062e2c 100%)" }}
    >
      {/* Nav */}
      <header className="flex items-center justify-between px-8 h-[72px]">
        <button
          onClick={() => setLocation("/")}
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c0fa79]"
          aria-label="Home"
        >
          <img src={logoImage} alt="VirtusGreen" className="h-9 w-auto object-contain brightness-0 invert" />
        </button>
        <LanguageSelector />
      </header>

      {/* Hero text */}
      <div
        className={`text-center pt-14 pb-12 px-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-[#c0fa79] bg-[#c0fa79]/10 border border-[#c0fa79]/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c0fa79] animate-pulse" />
          {t("landing.eyebrow", "Blockchain · Satellite · EU Compliance")}
        </span>
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-5 leading-[1.08]"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          {t("landing.headline", "Two products,")}<br />
          <em className="not-italic" style={{ color: "#c0fa79" }}>
            {t("landing.headlineAccent", "one mission.")}
          </em>
        </h1>
        <p className="text-white/55 text-lg max-w-md mx-auto leading-relaxed font-light">
          {t("landing.subheadline", "Making the truth about a product verifiable — for consumers and producers alike.")}
        </p>
      </div>

      {/* Product cards */}
      <div className="flex-1 flex items-start justify-center px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl">
          {cards.map((card, idx) => (
            <button
              key={card.path}
              onClick={() => go(card.path, card.label)}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className={`group relative text-left rounded-2xl p-7 flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-[#c0fa79] transition-all duration-400 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${idx * 120 + 200}ms`,
                background: "rgba(255,255,255,0.04)",
                border: hovered === idx ? `1px solid ${card.accentFrom}40` : "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                boxShadow: hovered === idx ? `0 0 40px ${card.accentFrom}18` : "none",
              }}
            >
              {/* top accent line */}
              <div
                className="absolute top-0 left-6 right-6 h-px rounded-full transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, ${card.accentFrom}, ${card.accentTo})`,
                  opacity: hovered === idx ? 1 : 0,
                }}
              />

              {card.badge && (
                <span className="absolute top-5 right-5 text-[10px] font-bold tracking-widest uppercase bg-[#c0fa79] text-[#043231] px-2.5 py-1 rounded-full">
                  {card.badge}
                </span>
              )}

              {/* icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 flex-none transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${card.accentFrom}18`, color: card.accentFrom }}
              >
                {card.icon}
              </div>

              {/* eyebrow */}
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase mb-2 flex-none" style={{ color: card.accentFrom }}>
                {card.eyebrow}
              </span>

              {/* title */}
              <div className="mb-3 flex-none">
                <h2 className="text-xl font-bold text-white mb-0.5">{card.title}</h2>
                <p className="text-[11px] font-semibold tracking-wider uppercase text-white/35">{card.subtitle}</p>
              </div>

              {/* desc */}
              <p className="text-white/55 text-sm leading-relaxed mb-5 flex-1">{card.desc}</p>

              {/* features */}
              <ul className="space-y-1.5 mb-6 flex-none">
                {(card.features || []).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/45">
                    <span className="w-1 h-1 rounded-full flex-none mt-1.5" style={{ background: card.accentFrom }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA row */}
              <div className="flex items-center gap-2 text-sm font-semibold transition-gap duration-200 group-hover:gap-3 flex-none mt-auto" style={{ color: card.accentFrom }}>
                {card.cta}
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer strip */}
      <footer className="py-4 px-8 text-center text-xs text-white/25 border-t border-white/5">
        © 2026 VirtusGreen · EU-wide ·{" "}
        <a href="mailto:hello@virtusgreen.com" className="hover:text-white/50 transition-colors">
          hello@virtusgreen.com
        </a>{" "}
        ·{" "}
        <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy</a>
        {" "}·{" "}
        <a href="/terms" className="hover:text-white/50 transition-colors">Terms</a>
      </footer>
    </div>
  );
}
