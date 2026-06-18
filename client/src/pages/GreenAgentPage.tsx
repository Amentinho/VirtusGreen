import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import GreenAgent from "@/components/GreenAgent";
import Footer from "@/components/Footer";
import logoImage from "@assets/Asset 77_1762949956789.png";
import LanguageSelector from "@/components/LanguageSelector";
import { trackEvent } from "@/lib/analytics";

export default function GreenAgentPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* Nav */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
            : "bg-background border-b border-border/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                trackEvent("nav_back", "navigation", "green_agent_to_landing");
                setLocation("/");
              }}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("greenAgentPage.back", "Back")}
            </button>
            <div className="w-px h-5 bg-border" />
            <img
              src={logoImage}
              alt="VirtusGreen"
              className="h-7 w-auto cursor-pointer"
              onClick={() => setLocation("/")}
            />
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                trackEvent("cta_click", "engagement", "green_agent_page_nav");
                document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("greenAgentPage.contactCta", "Book a call")}
            </Button>
          </div>
        </div>
      </header>

      {/* Green Agent section (reuses the existing component) */}
      <main>
        <GreenAgent />
      </main>

      <Footer />
    </div>
  );
}
