import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import EnvironmentalMetrics from "@/components/EnvironmentalMetrics";
import WhyVirtusGreen from "@/components/WhyVirtusGreen";
import ForCompanies from "@/components/ForCompanies";
import GreenAgent from "@/components/GreenAgent";
import Roadmap from "@/components/Roadmap";
import Team from "@/components/Team";
import Footer from "@/components/Footer";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        // Give the page time to fully render before scrolling
        setTimeout(() => {
          const element = document.getElementById(hash);
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
            window.history.replaceState(null, '', '/passport');
          }
        }, 200);
      }
    };

    scrollToHash();
    // Also listen for hash changes triggered by wouter navigation
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation scrolled={scrolled} />
      <main>
        <Hero />
        <HowItWorks />
        <EnvironmentalMetrics />
        <WhyVirtusGreen />
        <ForCompanies />
        <GreenAgent />
        <Roadmap />
        <Team />
      </main>
      <Footer />
    </div>
  );
}
