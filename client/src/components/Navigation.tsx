import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/aaa_1759692758271.jpg";

interface NavigationProps {
  scrolled: boolean;
}

export default function Navigation({ scrolled }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: "How it Works", id: "how-it-works" },
    { label: "Environmental Indexes", id: "environmental-metrics" },
    { label: "For Companies", id: "for-companies" },
    { label: "About Us", id: "team" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => scrollToSection("hero")}
              className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-lg px-3 py-2 -ml-3"
              data-testid="button-logo"
            >
              <img 
                src={logoImage} 
                alt="VirtusGreen Logo" 
                className="h-10 w-auto object-contain"
              />
            </button>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="px-4 py-2 text-sm font-medium text-foreground hover-elevate active-elevate-2 rounded-lg transition-colors"
                  data-testid={`link-${link.id}`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => scrollToSection("for-companies")}
                data-testid="button-for-companies-nav"
              >
                For Companies
              </Button>
              <Button
                className="bg-cta hover:bg-cta text-cta-foreground border-cta-border"
                onClick={() => scrollToSection("hero")}
                data-testid="button-download-app-nav"
              >
                Download App
              </Button>
            </div>

            <button
              className="md:hidden p-2 hover-elevate active-elevate-2 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-20 md:hidden">
          <div className="px-4 py-6 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="block w-full text-left px-4 py-3 text-base font-medium text-foreground hover-elevate active-elevate-2 rounded-lg"
                data-testid={`link-mobile-${link.id}`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => scrollToSection("for-companies")}
                data-testid="button-for-companies-mobile"
              >
                For Companies
              </Button>
              <Button
                className="w-full bg-cta hover:bg-cta text-cta-foreground border-cta-border"
                onClick={() => scrollToSection("hero")}
                data-testid="button-download-app-mobile"
              >
                Download App
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
