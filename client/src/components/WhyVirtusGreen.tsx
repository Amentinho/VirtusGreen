import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Shield, Smartphone, Gift } from "lucide-react";

export default function WhyVirtusGreen() {
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

  const values = [
    {
      icon: Shield,
      title: "Blockchain Transparency",
      description:
        "Immutable, verified sustainability data you can trust. Every metric is stored on blockchain for complete transparency and accountability.",
      features: ["Immutable records", "Verified data", "Full traceability"],
      color: "from-primary/20 to-primary/10",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      icon: Smartphone,
      title: "User-Friendly Experience",
      description:
        "Simple registration, intuitive scanning, instant insights. Get started in seconds and access environmental data with a single tap.",
      features: ["Quick setup", "Easy scanning", "Instant results"],
      color: "from-cta/20 to-cta/10",
      iconBg: "bg-cta/20",
      iconColor: "text-cta",
    },
    {
      icon: Gift,
      title: "Real Rewards",
      description:
        "Turn sustainable choices into tangible benefits. Earn tokens for eco-conscious decisions and redeem them for exclusive discounts. ",
      features: ["Earn tokens", "Exclusive discounts", "Free products"],
      color: "from-chart-2/20 to-chart-2/10",
      iconBg: "bg-chart-2/20",
      iconColor: "text-chart-2",
    },
  ];

  return (
    <section
      id="why-virtusgreen"
      ref={sectionRef}
      className="py-20 bg-background relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 space-y-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Why Choose VirtusGreen
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            The most trusted platform for sustainable shopping
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <Card className="relative overflow-hidden p-8 h-full hover-elevate active-elevate-2 group" data-testid={`card-why-virtusgreen-${index}`}>
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                
                <div className="relative z-10 space-y-6">
                  <div
                    className={`w-16 h-16 ${value.iconBg} rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                  >
                    <value.icon className={`w-8 h-8 ${value.iconColor}`} />
                  </div>

                  <div className="space-y-4">
                    <h3 className={`text-2xl font-bold text-foreground ${index === 2 ? 'mb-12' : ''}`} data-testid={`text-value-title-${index}`}>
                      {value.title}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed" data-testid={`text-value-description-${index}`}>
                      {value.description}
                    </p>

                    <ul className={`space-y-2 ${index === 2 ? 'pt-8' : 'pt-2'}`}>
                      {value.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-foreground"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
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
