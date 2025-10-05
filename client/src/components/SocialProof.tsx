import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Package, Cloud, Users, Building2 } from "lucide-react";

export default function SocialProof() {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({
    products: 0,
    co2: 0,
    users: 0,
    partners: 0,
  });
  const sectionRef = useRef<HTMLElement>(null);

  const finalCounts = {
    products: 120,
    co2: 450,
    users: 35,
    partners: 5,
  };

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

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setCounts({
        products: Math.floor(finalCounts.products * progress),
        co2: Math.floor(finalCounts.co2 * progress),
        users: Math.floor(finalCounts.users * progress),
        partners: Math.floor(finalCounts.partners * progress),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounts(finalCounts);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible]);

  const stats = [
    {
      icon: Package,
      label: "Products Analyzed",
      value: counts.products,
      suffix: "+",
      color: "from-primary/20 to-primary/10",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      icon: Cloud,
      label: "CO2 Equivalent Tracked",
      value: counts.co2,
      suffix: " kg",
      color: "from-destructive/20 to-destructive/10",
      iconBg: "bg-destructive/20",
      iconColor: "text-destructive",
    },
    {
      icon: Users,
      label: "Active Users",
      value: counts.users,
      suffix: "+",
      color: "from-cta/20 to-cta/10",
      iconBg: "bg-cta/20",
      iconColor: "text-cta",
    },
    {
      icon: Building2,
      label: "Partner Brands",
      value: counts.partners,
      suffix: "+",
      color: "from-chart-2/20 to-chart-2/10",
      iconBg: "bg-chart-2/20",
      iconColor: "text-chart-2",
    },
  ];

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <section
      id="social-proof"
      ref={sectionRef}
      className="py-20 bg-background relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 space-y-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Building the Future of Sustainability
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            We will provide the first results after the testing phase.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card className="relative overflow-hidden p-6 h-full hover-elevate active-elevate-2 group" data-testid={`card-stat-${index}`}>
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                
                <div className="relative z-10 space-y-4 text-center">
                  <div
                    className={`w-14 h-14 ${stat.iconBg} rounded-xl flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110`}
                  >
                    <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-base text-foreground font-semibold" data-testid={`text-stat-label-${index}`}>
                      {stat.label}
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
