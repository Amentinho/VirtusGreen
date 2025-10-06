import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote, Linkedin } from "lucide-react";
import founderPhoto from "@assets/1757088011096_1759750073591.jpg";

export default function Team() {
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

  return (
    <section
      id="team"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 space-y-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Meet Our Founder
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Leading the charge in sustainable technology
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <Card className="relative overflow-hidden p-8 md:p-12 hover-elevate active-elevate-2 group" data-testid="card-founder">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-cta/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-cta/20 rounded-full blur-2xl" />
                    <Avatar className="relative w-32 h-32 border-4 border-background ring-4 ring-primary/20">
                      <AvatarImage src={founderPhoto} alt="Andrea - Founder" />
                      <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-cta text-primary-foreground">
                        A
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-foreground" data-testid="text-founder-name">
                      Andrea
                    </h3>
                    <p className="text-lg font-medium text-muted-foreground" data-testid="text-founder-title">
                      Sustainability & Blockchain Expert
                    </p>
                    <p className="text-base text-foreground max-w-xl" data-testid="text-founder-bio">
                      Sustainability and green energy engineer. Blockchain and
                      decentralization addict.
                    </p>
                  </div>

                  <div className="relative mt-4 pt-6 border-t border-border w-full">
                    <Quote className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 text-primary bg-card" />
                    <blockquote className="text-xl font-medium text-primary italic" data-testid="text-founder-quote">
                      "Technology is the key to solve climate change"
                    </blockquote>
                  </div>

                  <div className="flex justify-center pt-4">
                    <a
                      href="https://www.linkedin.com/in/andrea-amenta/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover-elevate active-elevate-2 transition-colors"
                      data-testid="link-founder-linkedin"
                      aria-label="Andrea's LinkedIn"
                    >
                      <Linkedin className="w-5 h-5 text-secondary-foreground" />
                    </a>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 pt-4">
                    <div className="px-4 py-2 rounded-full bg-primary/10 text-sm font-medium text-primary">
                      Green Energy
                    </div>
                    <div className="px-4 py-2 rounded-full bg-cta/10 text-sm font-medium text-cta">
                      Blockchain
                    </div>
                    <div className="px-4 py-2 rounded-full bg-chart-2/10 text-sm font-medium text-chart-2">
                      Sustainability
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
