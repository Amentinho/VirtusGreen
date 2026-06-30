import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import GreenAgent from "@/components/GreenAgent";
import BatchVerificationDemo from "@/components/BatchVerificationDemo";
import ContactForm from "@/components/ContactForm";
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

  const scrollToForm = () => {
    trackEvent("cta_click", "engagement", "green_agent_book_call");
    const el = document.getElementById("contact-form");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">

      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border" : "bg-background border-b border-border/50"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { trackEvent("nav_back", "navigation", "green_agent_to_landing"); setLocation("/"); }}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("greenAgentPage.back", "Back")}
            </button>
            <div className="w-px h-5 bg-border" />
            <img src={logoImage} alt="VirtusGreen" className="h-7 w-auto cursor-pointer" onClick={() => setLocation("/")} />
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={scrollToForm}>
              {t("greenAgentPage.contactCta", "Book a call")}
            </Button>
          </div>
        </div>
      </header>

      <main>
        <GreenAgent />
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Live Batch Verification Demo</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                Select a product, enter a batch ID, and watch Green Agent cross-check it against real Copernicus Sentinel-2 satellite data.
              </p>
            </div>
            <BatchVerificationDemo />
          </div>
        </section>
        <ContactForm />
      </main>

      <footer className="border-t border-border/50 py-5 px-6 text-center text-xs text-muted-foreground">
        © 2026 VirtusGreen · Barcelona / EU-wide ·{" "}
        <a href="mailto:hello@virtusgreen.com" className="hover:text-primary transition-colors">hello@virtusgreen.com</a>
        {" · "}
        <button onClick={() => setLocation("/")} className="hover:text-primary transition-colors">
          {t("greenAgentPage.backToHome", "Back to home")}
        </button>
      </footer>

    </div>
  );
}
