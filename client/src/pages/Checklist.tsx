import { useTranslation } from "react-i18next";
import { Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function Checklist() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const pdfUrl = `/assets/7_day_sustainable_eating_checklist_${i18n.language}.pdf`;
  const days = t('checklist.days', { returnObjects: true }) as Array<{ title: string; body: string }>;
  const howToUseSteps = t('checklist.howToUseSteps', { returnObjects: true }) as string[];
  const benefits = t('checklist.benefits', { returnObjects: true }) as string[];

  return (
    <>
      <Helmet>
        <title>{t('checklist.title')}</title>
        <meta name="description" content={t('checklist.metaDesc')} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t('checklist.ogTitle')} />
        <meta property="og:description" content={t('checklist.ogDesc')} />
        <meta property="og:site_name" content="VirtusGreen" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('checklist.ogTitle')} />
        <meta name="twitter:description" content={t('checklist.ogDesc')} />
        <link rel="canonical" href={`/checklist/${i18n.language}/`} />
      </Helmet>

      <div className="min-h-screen" style={{ backgroundColor: '#fbf9f3' }}>
        <Navigation scrolled={scrolled} />
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <Card className="overflow-hidden border-none shadow-lg" data-testid="card-hero">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1">
                    <Badge 
                      className="mb-4 text-sm font-semibold"
                      style={{ 
                        backgroundColor: '#C0FA79', 
                        color: '#043231',
                        border: 'none'
                      }}
                      data-testid="badge-free"
                    >
                      {t('checklist.freeBadge')}
                    </Badge>
                    
                    <h1 
                      className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
                      style={{ color: '#043231' }}
                      data-testid="text-hero-title"
                    >
                      {t('checklist.heroTitle')}
                    </h1>
                    
                    <p 
                      className="text-lg md:text-xl mb-6 leading-relaxed"
                      style={{ color: '#043231', opacity: 0.8 }}
                      data-testid="text-hero-subtitle"
                    >
                      {t('checklist.heroSubtitle')}
                    </p>
                    
                    <Button
                      asChild
                      size="lg"
                      className="font-semibold text-white hover-elevate active-elevate-2"
                      style={{ backgroundColor: '#00AF67', border: 'none' }}
                      data-testid="button-download-hero"
                    >
                      <a href={pdfUrl} download>
                        <Download className="mr-2 h-5 w-5" />
                        {t('checklist.downloadBtn')}
                      </a>
                    </Button>
                  </div>
                  
                  <div className="md:w-64 flex flex-col items-center">
                    <div 
                      className="w-48 h-48 md:w-64 md:h-64 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#C0FA79' }}
                      data-testid="img-checklist-preview"
                    >
                      <div className="text-center" style={{ color: '#043231' }}>
                        <CheckCircle2 className="h-24 w-24 mx-auto mb-2" />
                        <p className="font-bold text-lg">7-Day<br />Checklist</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Left Column - What's Inside */}
            <div className="md:col-span-2">
              <Card className="border-none shadow-lg" data-testid="card-whats-inside">
                <CardContent className="p-8">
                  <h2 
                    className="text-3xl font-bold mb-6"
                    style={{ color: '#043231' }}
                    data-testid="text-whats-inside-title"
                  >
                    {t('checklist.whatsInside')}
                  </h2>
                  
                  <ul className="space-y-4" data-testid="list-days">
                    {days.map((day, index) => (
                      <li key={index} className="flex gap-3" data-testid={`list-item-day-${index + 1}`}>
                        <CheckCircle2 
                          className="h-6 w-6 flex-shrink-0 mt-0.5" 
                          style={{ color: '#00AF67' }}
                        />
                        <div>
                          <strong 
                            className="block mb-1"
                            style={{ color: '#043231' }}
                          >
                            {day.title}
                          </strong>
                          <p 
                            style={{ color: '#043231', opacity: 0.7 }}
                          >
                            {day.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 pt-8" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <h3 
                      className="text-2xl font-bold mb-3"
                      style={{ color: '#043231' }}
                      data-testid="text-who-is-this-for"
                    >
                      {t('checklist.whoIsThisFor')}
                    </h3>
                    <p 
                      className="mb-6"
                      style={{ color: '#043231', opacity: 0.7 }}
                      data-testid="text-who-is-this-for-desc"
                    >
                      {t('checklist.whoIsThisForText')}
                    </p>

                    <h3 
                      className="text-2xl font-bold mb-3"
                      style={{ color: '#043231' }}
                      data-testid="text-how-to-use"
                    >
                      {t('checklist.howToUse')}
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 mb-6" data-testid="list-how-to-use">
                      {howToUseSteps.map((step, index) => (
                        <li 
                          key={index}
                          style={{ color: '#043231', opacity: 0.7 }}
                          data-testid={`list-item-step-${index + 1}`}
                        >
                          {step}
                        </li>
                      ))}
                    </ol>

                    <Button
                      asChild
                      size="lg"
                      className="font-semibold text-white hover-elevate active-elevate-2"
                      style={{ backgroundColor: '#00AF67', border: 'none' }}
                      data-testid="button-download-content"
                    >
                      <a href={pdfUrl} download>
                        <Download className="mr-2 h-5 w-5" />
                        {t('checklist.downloadBtn')}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Benefits */}
            <div className="md:col-span-1">
              <Card 
                className="border-none shadow-lg sticky top-4"
                style={{ backgroundColor: '#f8fafc' }}
                data-testid="card-benefits"
              >
                <CardContent className="p-6">
                  <h3 
                    className="text-xl font-bold mb-4"
                    style={{ color: '#043231' }}
                    data-testid="text-quick-benefits"
                  >
                    {t('checklist.quickBenefits')}
                  </h3>
                  
                  <ul className="space-y-3 mb-6" data-testid="list-benefits">
                    {benefits.map((benefit, index) => (
                      <li 
                        key={index}
                        className="flex items-start gap-2"
                        data-testid={`list-item-benefit-${index + 1}`}
                      >
                        <CheckCircle2 
                          className="h-5 w-5 flex-shrink-0 mt-0.5" 
                          style={{ color: '#00AF67' }}
                        />
                        <span style={{ color: '#043231', opacity: 0.8 }}>
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div 
                    className="pt-6 mb-6"
                    style={{ borderTop: '1px solid #e5e7eb' }}
                  >
                    <p 
                      className="text-sm mb-4"
                      style={{ color: '#043231', opacity: 0.7 }}
                      data-testid="text-subscribe"
                    >
                      {t('checklist.subscribeText')}
                    </p>
                  </div>

                  <Button
                    asChild
                    className="w-full font-semibold text-white hover-elevate active-elevate-2"
                    style={{ backgroundColor: '#00AF67', border: 'none' }}
                    data-testid="button-get-checklist"
                  >
                    <a href={pdfUrl} download>
                      <Download className="mr-2 h-4 w-4" />
                      {t('checklist.getTheChecklist')}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <section 
          className="py-8"
          style={{ borderTop: '1px solid #e5e7eb' }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto text-center">
              <p 
                className="text-sm"
                style={{ color: '#043231', opacity: 0.6 }}
                data-testid="text-no-spam"
              >
                {t('checklist.noSpam')}
              </p>
              <p 
                className="text-sm mt-2"
                style={{ color: '#043231', opacity: 0.6 }}
              >
                © {new Date().getFullYear()} {t('footer.copyright')}
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
