import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListChecks, Calculator, Users } from "lucide-react";

export default function ForCompanies() {
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

  const services = [
    {
      icon: ListChecks,
      title: "Product Listing",
      description:
        "Get your products featured with EcoScore ratings. Increase visibility among eco-conscious consumers and showcase your commitment to sustainability.",
      features: [
        "EcoScore rating display",
        "Enhanced product visibility",
        "Consumer trust building",
      ],
      color: "from-primary/20 to-primary/10",
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      icon: Calculator,
      title: "LCA Calculation",
      description:
        "Professional Life Cycle Assessment using advanced mathematical methodologies. Get comprehensive environmental impact analysis from cradle to grave.",
      features: [
        "Advanced LCA methodologies",
        "Comprehensive analysis",
        "Industry-standard reporting",
      ],
      color: "from-cta/20 to-cta/10",
      iconBg: "bg-cta/20",
      iconColor: "text-cta",
    },
    {
      icon: Users,
      title: "Sustainability Consulting",
      description:
        "Expert guidance to minimize environmental impact. Our team helps you identify opportunities and implement sustainable practices across your value chain.",
      features: [
        "Expert consultation",
        "Impact reduction strategies",
        "Continuous improvement",
      ],
      color: "from-chart-2/20 to-chart-2/10",
      iconBg: "bg-chart-2/20",
      iconColor: "text-chart-2",
    },
  ];

  const scrollToContact = () => {
    const element = document.getElementById("footer");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="for-companies"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-primary/5 to-background relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 space-y-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Elevate Your Brand Through
            <br />
            <span className="text-primary">Verified Sustainability</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive services to showcase your environmental commitment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <Card className="relative overflow-hidden p-8 h-full hover-elevate active-elevate-2 group flex flex-col" data-testid={`card-company-service-${index}`}>
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                
                <div className="relative z-10 flex-1 flex flex-col">
                  <div
                    className={`w-16 h-16 ${service.iconBg} rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 mb-6`}
                  >
                    <service.icon className={`w-8 h-8 ${service.iconColor}`} />
                  </div>

                  <div className="flex-1 space-y-4 mb-6">
                    <h3 className="text-2xl font-bold text-foreground" data-testid={`text-service-title-${index}`}>
                      {service.title}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed" data-testid={`text-service-description-${index}`}>
                      {service.description}
                    </p>

                    <ul className="space-y-2 pt-2">
                      {service.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-foreground"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={scrollToContact}
                    data-testid={`button-learn-more-${index}`}
                  >
                    Learn More
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div
          className={`text-center transition-all duration-700 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "450ms" }}
        >
          <Button
            size="lg"
            className="bg-cta hover:bg-cta text-cta-foreground border-cta-border text-base px-8"
            onClick={scrollToContact}
            data-testid="button-get-started-companies"
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </section>
  );
}
