import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import barcodeIcon from "@assets/Asset 82_1762948369325.png";
import discoverIcon from "@assets/Asset 107_1763132403495.png";
import earnIcon from "@assets/Asset 108_1763132423783.png";
import { useTranslation } from "react-i18next";

export default function HowItWorks() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      icon: barcodeIcon,
      title: t('howItWorks.scan.title'),
      description: t('howItWorks.scan.description'),
      color: "from-cta/20 to-chart-2/20",
      isImage: true,
    },
    {
      icon: discoverIcon,
      title: t('howItWorks.discover.title'),
      description: t('howItWorks.discover.description'),
      color: "from-cta/20 to-chart-2/20",
      isImage: true,
    },
    {
      icon: earnIcon,
      title: t('howItWorks.earn.title'),
      description: t('howItWorks.earn.description'),
      color: "from-cta/20 to-chart-2/20",
      isImage: true,
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-20 bg-background relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 space-y-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            {t('howItWorks.title')}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <Card className="relative overflow-hidden p-8 h-full hover-elevate active-elevate-2 group" data-testid={`card-how-it-works-${index}`}>
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <img src={step.icon as string} alt={step.title} className="w-20 h-20 object-contain" />
                    </div>
                    <div className="text-5xl font-bold text-muted-foreground/20">
                      {index + 1}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-foreground" data-testid={`text-step-title-${index}`}>
                      {step.title}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed" data-testid={`text-step-description-${index}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
