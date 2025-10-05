import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Scan, Database, Coins } from "lucide-react";

export default function HowItWorks() {
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
      icon: Scan,
      title: "Scan",
      description: "Use your camera to scan any product barcode",
      color: "from-primary/20 to-primary/10",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      icon: Database,
      title: "Discover",
      description:
        "View transparent environmental impact data stored on blockchain",
      color: "from-cta/20 to-cta/10",
      iconBg: "bg-cta/20",
      iconColor: "text-cta",
    },
    {
      icon: Coins,
      title: "Earn",
      description: "Collect tokens and redeem for discounts and free products",
      color: "from-chart-2/20 to-chart-2/10",
      iconBg: "bg-chart-2/20",
      iconColor: "text-chart-2",
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
            How It Works
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Three simple steps to start your sustainable journey
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
                    <div
                      className={`w-16 h-16 ${step.iconBg} rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                    >
                      <step.icon className={`w-8 h-8 ${step.iconColor}`} />
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

                  <div className="pt-4">
                    <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${step.color.replace("/20", "").replace("/10", "")} transition-all duration-1000 ${
                          isVisible ? "w-full" : "w-0"
                        }`}
                        style={{ transitionDelay: `${index * 150 + 500}ms` }}
                      />
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
