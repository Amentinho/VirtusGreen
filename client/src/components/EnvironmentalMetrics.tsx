import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import greenhouseIcon from "@assets/Asset 88_1762948369318.png";
import waterIcon from "@assets/Asset 87_1762948369315.png";
import energyIcon from "@assets/Asset 86_1762948369334.png";
import renewableIcon from "@assets/Asset 85_1762948369332.png";
import recycledIcon from "@assets/Asset 84_1762948369329.png";
import recyclableIcon from "@assets/Asset 83_1762948369327.png";
import { useTranslation } from "react-i18next";

export default function EnvironmentalMetrics() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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

  const metrics = [
    {
      icon: greenhouseIcon,
      title: t('metrics.greenhouse.title'),
      shortDesc: t('metrics.greenhouse.shortDesc'),
      fullDesc: t('metrics.greenhouse.fullDesc'),
      color: "from-cta/20 to-chart-2/20",
    },
    {
      icon: waterIcon,
      title: t('metrics.water.title'),
      shortDesc: t('metrics.water.shortDesc'),
      fullDesc: t('metrics.water.fullDesc'),
      color: "from-cta/20 to-chart-2/20",
    },
    {
      icon: energyIcon,
      title: t('metrics.energy.title'),
      shortDesc: t('metrics.energy.shortDesc'),
      fullDesc: t('metrics.energy.fullDesc'),
      color: "from-cta/20 to-chart-2/20",
    },
    {
      icon: renewableIcon,
      title: t('metrics.renewable.title'),
      shortDesc: t('metrics.renewable.shortDesc'),
      fullDesc: t('metrics.renewable.fullDesc'),
      color: "from-cta/20 to-chart-2/20",
    },
    {
      icon: recycledIcon,
      title: t('metrics.recycled.title'),
      shortDesc: t('metrics.recycled.shortDesc'),
      fullDesc: t('metrics.recycled.fullDesc'),
      color: "from-cta/20 to-chart-2/20",
    },
    {
      icon: recyclableIcon,
      title: t('metrics.recyclable.title'),
      shortDesc: t('metrics.recyclable.shortDesc'),
      fullDesc: t('metrics.recyclable.fullDesc'),
      color: "from-cta/20 to-chart-2/20",
    },
  ];

  return (
    <section
      id="environmental-metrics"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 space-y-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            {t('metrics.title')}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('metrics.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Card
                className="relative overflow-hidden p-6 h-full hover-elevate active-elevate-2 group cursor-pointer"
                data-testid={`card-metric-${index}`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-100 transition-all duration-500`}
                />
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <img src={metric.icon} alt={metric.title} className="w-20 h-20 object-contain" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground" data-testid={`text-metric-title-${index}`}>
                      {metric.title}
                    </h3>
                    <p
                      className={`text-sm text-muted-foreground transition-all duration-300 ${
                        hoveredIndex === index ? "opacity-0 h-0" : "opacity-100"
                      }`}
                      data-testid={`text-metric-short-${index}`}
                    >
                      {metric.shortDesc}
                    </p>
                    <p
                      className={`text-sm text-muted-foreground transition-all duration-300 ${
                        hoveredIndex === index
                          ? "opacity-100"
                          : "opacity-0 absolute"
                      }`}
                      data-testid={`text-metric-full-${index}`}
                    >
                      {metric.fullDesc}
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-cta animate-pulse" />
                      <span>{t('metrics.blockchainVerification')}</span>
                    </div>
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
