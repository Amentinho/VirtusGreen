import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import logoImage from "@assets/logo-horizontal.png";
import { trackEvent } from "@/lib/analytics";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import LanguageSelector from "./LanguageSelector";

interface NavigationProps { scrolled: boolean; }

export default function Navigation({ scrolled }: NavigationProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const scrollTo = (id: string) => {
    if (location !== "/") { setLocation(`/#${id}`); }
    else {
      const el = document.getElementById(id);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
    trackEvent("nav_click", "navigation", id);
    setOpen(false);
  };

  const navLinks = [
    { label: t("navigation.howItWorks"), id: "how-it-works" },
    { label: "Green Agent", id: "green-agent" },
    { label: t("navigation.forCompanies"), id: "for-companies" },
    { label: t("navigation.roadmap"), id: "roadmap" },
    { label: t("navigation.aboutUs"), id: "team" },
  ];

  // Determine if hero is dark so we know what color the nav text should be
  const heroIsDark = !scrolled && location === "/";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border/40 shadow-sm"
            : heroIsDark
            ? "bg-transparent border-b border-white/0"
            : "bg-background/80 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-[72px]">

            {/* Logo */}
            <button
              onClick={() => scrollTo("hero")}
              className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c0fa79]"
              data-testid="button-logo"
              aria-label="VirtusGreen home"
            >
              <img
                src={logoImage}
                alt="VirtusGreen"
                className={`h-9 w-auto object-contain transition-all duration-300 ${heroIsDark ? "brightness-0 invert" : ""}`}
              />
            </button>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className={`px-3.5 py-2 text-[13px] font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c0fa79] ${
                    heroIsDark
                      ? "text-white/70 hover:text-white hover:bg-white/8"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted/60"
                  }`}
                  data-testid={`link-${link.id}`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop right actions */}
            <div className="hidden md:flex items-center gap-2.5">
              <LanguageSelector />
              <button
                onClick={() => { setLocation("/checklist"); trackEvent("checklist_nav", "navigation", "desktop"); }}
                className="text-[13px] font-semibold px-4 py-2 rounded-lg transition-all duration-150"
                style={{ background: "#c0fa79", color: "#043231" }}
                data-testid="button-checklist-nav"
              >
                {t("navigation.freeChecklist")}
              </button>
              <button
                onClick={() => scrollTo("footer")}
                className={`text-[13px] font-semibold px-4 py-2 rounded-lg border transition-colors duration-150 ${
                  heroIsDark
                    ? "border-white/20 text-white hover:bg-white/10"
                    : "border-border text-foreground hover:bg-muted"
                }`}
                data-testid="button-get-in-touch-nav"
              >
                {t("navigation.getInTouch")}
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${
                heroIsDark ? "text-white hover:bg-white/10" : "text-foreground hover:bg-muted"
              }`}
              onClick={() => setOpen(v => !v)}
              aria-label="Toggle menu"
              data-testid="button-mobile-menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile menu — full-screen overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#021c1b]/97 backdrop-blur-xl flex flex-col md:hidden transition-all duration-400 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="h-[72px] flex items-center px-6 border-b border-white/8">
          <img src={logoImage} alt="VirtusGreen" className="h-9 brightness-0 invert" />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-1">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="w-full flex items-center justify-between px-4 py-4 rounded-xl text-white/80 hover:text-white hover:bg-white/6 transition-colors text-base font-medium"
              data-testid={`link-mobile-${link.id}`}
            >
              {link.label}
              <ChevronRight className="w-4 h-4 text-white/30" />
            </button>
          ))}
        </div>
        <div className="px-6 pb-10 space-y-3">
          <div className="flex justify-center pb-1">
            <LanguageSelector />
          </div>
          <button
            onClick={() => { setLocation("/checklist"); setOpen(false); trackEvent("checklist_nav", "navigation", "mobile"); }}
            className="w-full py-3.5 rounded-xl text-sm font-bold"
            style={{ background: "#c0fa79", color: "#043231" }}
          >
            {t("navigation.freeChecklist")}
          </button>
          <button
            onClick={() => scrollTo("footer")}
            className="w-full py-3.5 rounded-xl text-sm font-semibold border border-white/20 text-white hover:bg-white/8 transition-colors"
          >
            {t("navigation.getInTouch")}
          </button>
        </div>
      </div>
    </>
  );
}
