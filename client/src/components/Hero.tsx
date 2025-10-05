import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, Gift, Smartphone } from "lucide-react";
import barcodeScanningImage from "@assets/stock_images/hand_holding_smartph_de1df2e4.jpg";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
    }
  };

  const detectPlatform = () => {
    const userAgent = navigator.userAgent || navigator.vendor;
    
    if (/android/i.test(userAgent)) {
      return "android";
    }
    
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return "ios";
    }
    
    if (
      navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1
    ) {
      return "ios";
    }
    
    return "web";
  };

  const handleDownloadClick = () => {
    const platform = detectPlatform();
    const appStoreUrl = "https://apps.apple.com/us/app/virtusgreen/id123456789?mt=8&ct=hero-cta";
    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.virtusgreen.app&referrer=utm_source%3Dwebsite%26utm_medium%3Dhero-cta";
    
    if (platform === "ios") {
      window.open(appStoreUrl, "_blank", "noopener,noreferrer");
    } else if (platform === "android") {
      window.open(playStoreUrl, "_blank", "noopener,noreferrer");
    } else {
      window.open(playStoreUrl, "_blank", "noopener,noreferrer");
    }
  };

  const trustIndicators = [
    { icon: Shield, label: "Blockchain-Verified Data", badge: "Coming Soon" },
    { icon: TrendingUp, label: "Transparent Impact Metrics" },
    { icon: Gift, label: "Real Rewards", badge: "Coming Soon" },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-br from-background via-background to-primary/5"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cta/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            className={`space-y-8 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight" data-testid="text-hero-title">
                Transform Sustainability Into{" "}
                <span className="text-primary">Rewards</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl" data-testid="text-hero-subtitle">
                Scan. Learn. Earn. The blockchain-powered app that makes
                sustainable shopping rewarding.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => scrollToSection("for-companies")}
                className="bg-cta hover:bg-cta text-cta-foreground border-cta-border text-base px-8"
                data-testid="button-for-companies-hero"
              >
                For Companies
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("footer")}
                className="text-base px-8 backdrop-blur-sm"
                data-testid="button-get-in-touch-hero"
              >
                Get in Touch
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              {trustIndicators.map((indicator, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-4 py-2 text-sm font-medium flex items-center gap-2"
                  data-testid={`badge-trust-${index}`}
                >
                  <indicator.icon className="w-4 h-4" />
                  <span>{indicator.label}</span>
                  {indicator.badge && (
                    <span className="ml-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                      {indicator.badge}
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-cta/20 rounded-3xl blur-2xl transform rotate-6" />
              <div className="relative bg-card border border-card-border rounded-3xl p-8 backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-primary/10 to-cta/10 flex items-center justify-center overflow-hidden">
                    <div className="text-center space-y-4 p-8">
                      <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                        <Smartphone className="w-12 h-12 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-foreground">
                          Scan Any Product
                        </p>
                        <p className="text-muted-foreground">
                          Get instant environmental insights
                        </p>
                      </div>
                      <div className="w-full mt-4">
                        <img 
                          src={barcodeScanningImage} 
                          alt="Barcode scanning example" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
