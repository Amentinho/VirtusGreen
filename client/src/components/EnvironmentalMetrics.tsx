import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import greenhouseIcon from "@assets/Asset 88_1762948369318.png";
import waterIcon from "@assets/Asset 87_1762948369315.png";
import energyIcon from "@assets/Asset 86_1762948369334.png";
import renewableIcon from "@assets/Asset 85_1762948369332.png";
import recycledIcon from "@assets/Asset 84_1762948369329.png";
import recyclableIcon from "@assets/Asset 83_1762948369327.png";

export default function EnvironmentalMetrics() {
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
      title: "Greenhouse Gas Emissions",
      shortDesc: "CO2 equivalent tracking",
      fullDesc:
        "Comprehensive measurement of carbon footprint throughout the product lifecycle",
      color: "from-destructive/20 to-destructive/10",
      iconBg: "bg-destructive/20",
      iconColor: "text-destructive",
    },
    {
      icon: waterIcon,
      title: "Water Consumption",
      shortDesc: "Water usage metrics",
      fullDesc:
        "Track water consumption from production to delivery, promoting conservation",
      color: "from-blue-500/20 to-blue-500/10",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-500",
    },
    {
      icon: energyIcon,
      title: "Energy Usage",
      shortDesc: "Total energy consumption",
      fullDesc:
        "Monitor energy consumption across manufacturing and distribution processes",
      color: "from-yellow-500/20 to-yellow-500/10",
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-500",
    },
    {
      icon: renewableIcon,
      title: "Renewable Energies",
      shortDesc: "Clean energy sources",
      fullDesc:
        "Percentage of renewable energy used in production and operations",
      color: "from-orange-500/20 to-orange-500/10",
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-500",
    },
    {
      icon: recycledIcon,
      title: "Recycled Materials",
      shortDesc: "Recycled content percentage",
      fullDesc:
        "Track the use of recycled materials in product manufacturing",
      color: "from-primary/20 to-primary/10",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      icon: recyclableIcon,
      title: "Recyclable Materials",
      shortDesc: "End-of-life recyclability",
      fullDesc:
        "Measure how much of the product can be recycled at end of life",
      color: "from-cta/20 to-cta/10",
      iconBg: "bg-cta/20",
      iconColor: "text-cta",
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
            Environmental Impact Metrics
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Track six key sustainability indexes for comprehensive environmental assessment
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
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                      <span>Blockchain verification coming soon</span>
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
