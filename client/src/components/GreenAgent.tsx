import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MapPin, Satellite, QrCode, ShieldAlert, FileCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { trackEvent } from "@/lib/analytics";

export default function GreenAgent() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [activeSkin, setActiveSkin] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const skins = t("greenAgent.skins", { returnObjects: true }) as {
    label: string;
    icon: string;
    tag: string;
    headline: string;
    body: string;
  }[];

  const features = t("greenAgent.features", { returnObjects: true }) as {
    icon: string;
    title: string;
    description: string;
  }[];

  const icons = [MapPin, Satellite, QrCode, FileCheck];

  const scrollToContact = () => {
    const el = document.getElementById("footer");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      trackEvent("cta_click", "engagement", "green_agent_section");
    }
  };

  return (
    <section
      id="green-agent"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-cta/10 via-transparent to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div
          className={`text-center mb-16 space-y-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Badge variant="secondary" className="px-4 py-1.5 text-sm font-semibold text-cta border border-cta/30 bg-cta/10">
            {t("greenAgent.badge")}
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            {t("greenAgent.title")}
            <br />
            <span className="text-cta">{t("greenAgent.titleHighlight")}</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("greenAgent.subtitle")}
          </p>
        </div>

        {/* Product skin selector */}
        <div
          className={`flex flex-wrap justify-center gap-3 mb-12 transition-all duration-700 delay-150 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {skins.map((skin, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveSkin(i);
                trackEvent("green_agent_skin_select", "engagement", skin.label);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                activeSkin === i
                  ? "bg-cta text-cta-foreground border-cta shadow-md shadow-cta/25"
                  : "bg-card border-card-border text-muted-foreground hover:border-cta/50 hover:text-foreground"
              }`}
              data-testid={`button-skin-${i}`}
            >
              <span>{skin.icon}</span>
              {skin.label}
            </button>
          ))}
        </div>

        {/* Active skin card */}
        <div
          className={`mb-16 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <Card className="relative overflow-hidden p-8 md:p-12 hover-elevate group" data-testid="card-green-agent-skin">
            <div className="absolute inset-0 bg-gradient-to-br from-cta/10 to-chart-2/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-none">
                <div className="w-20 h-20 rounded-2xl bg-cta/10 flex items-center justify-center text-4xl">
                  {skins[activeSkin]?.icon}
                </div>
              </div>
              <div className="flex-1">
                <Badge variant="outline" className="mb-3 text-cta border-cta/40">
                  {skins[activeSkin]?.tag}
                </Badge>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {skins[activeSkin]?.headline}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base max-w-2xl">
                  {skins[activeSkin]?.body}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {features.map((f, i) => {
            const Icon = icons[i] || ShieldAlert;
            return (
              <div
                key={i}
                className={`transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${300 + i * 100}ms` }}
              >
                <Card className="p-6 h-full hover-elevate active-elevate-2 group" data-testid={`card-agent-feature-${i}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-cta/20 to-chart-2/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  <div className="relative z-10 space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-cta/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <Icon className="w-5 h-5 text-cta" />
                    </div>
                    <h4 className="font-bold text-foreground">{f.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Compliance badges */}
        <div
          className={`flex flex-wrap justify-center gap-2 mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "700ms" }}
        >
          {(t("greenAgent.regulations", { returnObjects: true }) as string[]).map((reg, i) => (
            <Badge key={i} variant="secondary" className="px-3 py-1.5 text-xs font-medium">
              <CheckCircle2 className="w-3 h-3 mr-1.5 text-cta" />
              {reg}
            </Badge>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "800ms" }}
        >
          <Button
            size="lg"
            className="bg-cta hover:bg-cta text-cta-foreground border-cta-border text-base px-8"
            onClick={scrollToContact}
            data-testid="button-green-agent-cta"
          >
            {t("greenAgent.cta")}
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">{t("greenAgent.ctaSub")}</p>
        </div>

      </div>
    </section>
  );
}
