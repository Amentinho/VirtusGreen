import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export default function Roadmap() {
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

  const roadmapItems = [
    {
      quarter: "Q2 2025",
      title: "Foundation & Plan",
      status: "completed",
      items: [
        "Platform architecture design",
        "Gamification experience",
        "Brand identity development",
        "Rewarding system definition",
      ],
    },
    {
      quarter: "Q3 2025",
      title: "Platform Development",
      status: "completed",
      items: [
        "Mobile application development",
        "Sustainability indicators",
        "Database infrastructure",
        "Rewarding system implementation",
        "Social media strategy",
      ],
    },
    {
      quarter: "Q4 2025",
      title: "Beta Launch",
      status: "in-progress",
      items: [
        "Beta testing with users",
        "User feedback integration",
        "Security audits",
        "API integrations with partners",
        "Marketing & Social Media",
      ],
    },
    {
      quarter: "Q1 2026",
      title: "Public Launch",
      status: "upcoming",
      items: [
        "Full platform launch",
        "App store releases (iOS & Android)",
        "Partner onboarding program",
        "Customer engagement",
        "Reward system implementation",
      ],
    },
    {
      quarter: "2026+",
      title: "Deep Tech Enhancements",
      status: "upcoming",
      items: [
        "Blockchain stack development",
        "Image recognition for products",
        "Token generation",
        "Sustainability impact calculator",
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6 text-cta" />;
      case "in-progress":
        return <Clock className="w-6 h-6 text-cta" />;
      default:
        return <Circle className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-cta/20 text-cta hover:bg-cta/20">
            Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-cta/20 text-cta hover:bg-cta/20">
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            Upcoming
          </Badge>
        );
    }
  };

  return (
    <section
      id="roadmap"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cta/10 via-chart-2/5 to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 space-y-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Our Roadmap
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Follow our journey as we build the future of sustainable shopping
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {roadmapItems.map((item, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <Card className="relative overflow-hidden p-6 h-full hover-elevate active-elevate-2 group flex flex-col" data-testid={`card-roadmap-${index}`}>
                <div
                  className="absolute inset-0 bg-gradient-to-br from-cta/20 to-chart-2/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                
                <div className="relative z-10 flex items-start justify-between mb-4">
                  {getStatusIcon(item.status)}
                  {getStatusBadge(item.status)}
                </div>
                
                <div className="relative z-10 space-y-3 flex-1">
                  <div>
                    <p className="text-sm font-semibold text-cta mb-1" data-testid={`text-roadmap-quarter-${index}`}>
                      {item.quarter}
                    </p>
                    <h3 className="text-xl font-bold text-foreground" data-testid={`text-roadmap-title-${index}`}>
                      {item.title}
                    </h3>
                  </div>

                  <ul className="space-y-2">
                    {item.items.map((task, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                          item.status === "completed" 
                            ? "bg-cta" 
                            : item.status === "in-progress"
                            ? "bg-cta"
                            : "bg-muted-foreground/50"
                        }`} />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
