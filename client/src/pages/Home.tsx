import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import EnvironmentalMetrics from "@/components/EnvironmentalMetrics";
import WhyVirtusGreen from "@/components/WhyVirtusGreen";
import ForCompanies from "@/components/ForCompanies";
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation scrolled={scrolled} />
      <main>
        <Hero />
        <HowItWorks />
        <EnvironmentalMetrics />
        <WhyVirtusGreen />
        <ForCompanies />
        <Roadmap />
        <Team />
      </main>
      <Footer />
    </div>
  );
}
