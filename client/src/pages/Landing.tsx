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

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <img src={logoImage} alt="VirtusGreen" className="h-8 w-auto" />
        <LanguageSelector />
      </header>

      {/* Hero text */}
      <div
        className={`text-center pt-14 pb-8 px-6 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-5">
          {t("landing.eyebrow", "Blockchain & AI · Verified provenance")}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
          {t("landing.headline", "What are you here for?")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          {t("landing.subheadline", "Two products, one mission — making the truth about a product verifiable.")}
        </p>
      </div>

      {/* Product cards */}
      <div className="flex-1 flex items-start justify-center px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">

          {/* Passport card */}
          <button
            onClick={() => go("/passport", "passport")}
            className={`group relative text-left rounded-2xl border border-border bg-card p-8 transition-all duration-500 hover:border-primary hover:shadow-2xl hover:shadow-primary/15 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "150ms" }}
          >
            {/* top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
              <Shield className="w-7 h-7 text-primary" />
            </div>

            <div className="mb-2">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                {t("landing.passportLabel", "Live product")}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-3">
              {t("landing.passportTitle", "Passport")}
              <span className="block text-sm font-medium text-muted-foreground mt-0.5 tracking-wide uppercase">
                {t("landing.passportSubtitle", "Digital Product Passport")}
              </span>
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-6">
              {t("landing.passportDesc", "Scan a product barcode, see its verified environmental story — CO₂, water, energy — and earn tokens for sustainable choices. Gamified loyalty for everyday shoppers.")}
            </p>

            <ul className="space-y-2 mb-8">
              {(t("landing.passportFeatures", { returnObjects: true }) as string[]).map((f: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-none" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all duration-200">
              {t("landing.passportCta", "Explore Passport")}
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Green Agent card */}
          <button
            onClick={() => go("/green-agent", "green-agent")}
            className={`group relative text-left rounded-2xl border border-border bg-card p-8 transition-all duration-500 hover:border-primary hover:shadow-2xl hover:shadow-primary/15 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "280ms" }}
          >
            {/* top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-emerald-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* NEW badge */}
            <div className="absolute top-5 right-5">
              <span className="text-xs font-bold tracking-widest uppercase bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
                {t("landing.newBadge", "New")}
              </span>
            </div>

            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
              <Leaf className="w-7 h-7 text-primary" />
            </div>

            <div className="mb-2">
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                {t("landing.agentLabel", "GI Authenticity & Compliance")}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-3">
              {t("landing.agentTitle", "Green Agent")}
              <span className="block text-sm font-medium text-muted-foreground mt-0.5 tracking-wide uppercase">
                {t("landing.agentSubtitle", "Provenance · EUDR · E-label")}
              </span>
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-6">
              {t("landing.agentDesc", "For consortia and premium GI producers. AI agents cross-check plot geolocation against satellite data and denomination rules — a fake batch cannot pass.")}
            </p>

            <ul className="space-y-2 mb-8">
              {(t("landing.agentFeatures", { returnObjects: true }) as string[]).map((f: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-none" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all duration-200">
              {t("landing.agentCta", "Explore Green Agent")}
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

        </div>
      </div>

      {/* Footer strip */}
      <footer className="border-t border-border/50 py-4 px-6 text-center text-xs text-muted-foreground">
        © 2026 VirtusGreen · Barcelona / EU-wide ·{" "}
        <a href="mailto:hello@virtusgreen.com" className="hover:text-primary transition-colors">
          hello@virtusgreen.com
        </a>
      </footer>

    </div>
  );
}
