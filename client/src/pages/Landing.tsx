import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowRight, Shield, Leaf } from "lucide-react";
import logoImage from "@assets/Asset 77_1762949956789.png";
import LanguageSelector from "@/components/LanguageSelector";
import { trackEvent } from "@/lib/analytics";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
  }, []);

  const go = (path: string, label: string) => {
    trackEvent("product_select", "navigation", label);
    setLocation(path);
  };

  const cards = [
    {
      path: "/passport",
      label: "passport",
      delay: "150ms",
      icon: <Shield className="w-7 h-7 text-cta" />,
      eyebrow: t("landing.passportLabel", "Live product"),
      title: t("landing.passportTitle", "Passport"),
      subtitle: t("landing.passportSubtitle", "Digital Product Passport"),
      desc: t("landing.passportDesc", "Scan a product barcode, see its verified environmental story — CO₂, water, energy — and earn tokens for sustainable choices. Gamified loyalty for everyday shoppers."),
      features: t("landing.passportFeatures", { returnObjects: true }) as string[],
      cta: t("landing.passportCta", "Explore Passport"),
      badge: null,
    },
    {
      path: "/green-agent",
      label: "green-agent",
      delay: "280ms",
      icon: <Leaf className="w-7 h-7 text-cta" />,
      eyebrow: t("landing.agentLabel", "GI Authenticity & Compliance"),
      title: t("landing.agentTitle", "Green Agent"),
      subtitle: t("landing.agentSubtitle", "Provenance · EUDR · E-label"),
      desc: t("landing.agentDesc", "For consortia and premium GI producers. AI agents cross-check plot geolocation against satellite data and denomination rules — a fake batch cannot pass."),
      features: t("landing.agentFeatures", { returnObjects: true }) as string[],
      cta: t("landing.agentCta", "Explore Green Agent"),
      badge: t("landing.newBadge", "New"),
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 h-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-lg px-3 py-2 -ml-3"
        >
          <img src={logoImage} alt="VirtusGreen" className="h-10 w-auto object-contain" />
        </button>
        <LanguageSelector />
      </header>

      {/* Hero text */}
      <div
        className={`text-center pt-14 pb-10 px-6 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-cta bg-cta/10 px-4 py-1.5 rounded-full mb-5 border border-cta/20">
          {t("landing.eyebrow", "Blockchain & AI · Verified provenance")}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
          {t("landing.headline", "What are you here for?")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
          {t("landing.subheadline", "Two products, one mission — making the truth about a product verifiable.")}
        </p>
      </div>

      {/* Product cards — both use flex-col so rows align */}
      <div className="flex-1 flex items-start justify-center px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl md:items-stretch">

          {cards.map((card) => (
            <button
              key={card.path}
              onClick={() => go(card.path, card.label)}
              className={`group relative text-left rounded-2xl border border-card-border bg-card p-8
                flex flex-col
                transition-all duration-500
                hover:border-cta/50 hover:shadow-xl hover:-translate-y-1
                focus:outline-none focus-visible:ring-2 focus-visible:ring-cta ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: card.delay }}
            >
              {/* hover accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-cta to-accent-lime opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* NEW badge */}
              {card.badge && (
                <div className="absolute top-5 right-5">
                  <span className="text-xs font-bold tracking-widest uppercase bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
                    {card.badge}
                  </span>
                </div>
              )}

              {/* ── Row 1: icon ── */}
              <div className="w-14 h-14 rounded-xl bg-cta/10 flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-cta/20 flex-none">
                {card.icon}
              </div>

              {/* ── Row 2: eyebrow label ── */}
              <span className="text-xs font-semibold tracking-widest uppercase text-cta block mb-3 flex-none">
                {card.eyebrow}
              </span>

              {/* ── Row 3: title + subtitle ── */}
              <div className="mb-4 flex-none">
                <h2 className="text-2xl font-bold text-foreground mb-1">{card.title}</h2>
                <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                  {card.subtitle}
                </p>
              </div>

              {/* ── Row 4: description — flex-1 so it fills available space ── */}
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm flex-1">
                {card.desc}
              </p>

              {/* ── Row 5: bullet features ── */}
              <ul className="space-y-2 mb-8 flex-none">
                {card.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-cta flex-none mt-1.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* ── Row 6: CTA — always at bottom ── */}
              <div className="flex items-center gap-2 text-cta font-semibold text-sm group-hover:gap-3 transition-all duration-200 flex-none mt-auto">
                {card.cta}
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}

        </div>
      </div>

      {/* Footer strip */}
      <footer className="border-t border-border/60 py-4 px-6 text-center text-xs text-muted-foreground bg-card/50">
        © 2026 VirtusGreen · Barcelona / EU-wide ·{" "}
        <a href="mailto:hello@virtusgreen.com" className="hover:text-foreground transition-colors">
          hello@virtusgreen.com
        </a>
      </footer>

    </div>
  );
}
