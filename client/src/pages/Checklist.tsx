import { useTranslation } from "react-i18next";
import { CheckCircle2, Leaf, TrendingDown, Package, MapPin, BarChart3, Calendar, Lightbulb } from "lucide-react";
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

  // Get translated content
  const impacts = t('checklist.impacts', { returnObjects: true }) as any;
  const caseStudies = t('checklist.caseStudies', { returnObjects: true }) as any;
  const sidebar = t('checklist.sidebar', { returnObjects: true }) as any;
  const shortChecklist = t('checklist.shortChecklist', { returnObjects: true }) as any;
  const sources = t('checklist.sources', { returnObjects: true }) as any;
  const bigPicture = t('checklist.bigPicture', { returnObjects: true }) as any;
  const badges = t('checklist.badges', { returnObjects: true }) as any;
  
  // Manually construct days array from individual day objects
  const days = [
    t('checklist.day1', { returnObjects: true }),
    t('checklist.day2', { returnObjects: true }),
    t('checklist.day3', { returnObjects: true }),
    t('checklist.day4', { returnObjects: true }),
    t('checklist.day5', { returnObjects: true }),
    t('checklist.day6', { returnObjects: true }),
    t('checklist.day7', { returnObjects: true })
  ] as Array<{ title: string; body?: string; why?: string; howTitle?: string; tips?: string[]; example?: string; metric?: string; note?: string }>;

  const dayIcons = [Leaf, Calendar, TrendingDown, Package, MapPin, BarChart3, CheckCircle2];

  const impactsList = [
    { title: t('checklist.impacts.productionTitle'), text: impacts.production },
    { title: t('checklist.impacts.landUseTitle'), text: impacts.landUse },
    { title: t('checklist.impacts.processingTitle'), text: impacts.processing },
    { title: t('checklist.impacts.wasteTitle'), text: impacts.waste }
  ];

  const caseStudiesList = [
    { title: caseStudies.tooGoodToGo.title, text: caseStudies.tooGoodToGo.content },
    { title: caseStudies.oddbox.title, text: caseStudies.oddbox.content },
    { title: caseStudies.walmart.title, text: caseStudies.walmart.content }
  ];

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
        <section className="pt-24 pb-12 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-6 flex justify-center gap-3 flex-wrap">
              <Badge 
                className="text-sm font-bold px-4 py-1.5"
                style={{ backgroundColor: '#C0FA79', color: '#043231', border: 'none' }}
                data-testid="badge-practical"
              >
                {badges.practical}
              </Badge>
              <Badge 
                className="text-sm font-bold px-4 py-1.5"
                style={{ backgroundColor: '#00AF67', color: 'white', border: 'none' }}
                data-testid="badge-evidence"
              >
                {badges.evidenceBacked}
              </Badge>
              <Badge 
                className="text-sm font-bold px-4 py-1.5"
                style={{ backgroundColor: '#C0FA79', color: '#043231', border: 'none' }}
                data-testid="badge-actionable"
              >
                {badges.actionable}
              </Badge>
            </div>
            
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              style={{ color: '#043231' }}
              data-testid="text-hero-title"
            >
              {t('checklist.heroTitle')}
            </h1>
            
            <p 
              className="text-xl md:text-2xl mb-4 leading-relaxed max-w-3xl mx-auto"
              style={{ color: '#043231' }}
              data-testid="text-hero-subtitle"
            >
              {t('checklist.heroSubtitle')}
            </p>
            
            <p 
              className="text-lg leading-relaxed max-w-2xl mx-auto"
              style={{ color: '#043231', opacity: 0.7 }}
              data-testid="text-hero-lead"
            >
              {t('checklist.heroLead')}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Main Column */}
              <div className="md:col-span-2 space-y-8">
                {/* Big Picture */}
                <Card className="border-none shadow-lg" data-testid="card-big-picture">
                  <CardContent className="p-8">
                    <h2 
                      className="text-3xl font-bold mb-4"
                      style={{ color: '#043231' }}
                    >
                      {bigPicture.title}
                    </h2>
                    <p 
                      className="text-base leading-relaxed mb-3"
                      style={{ color: '#043231', opacity: 0.8 }}
                    >
                      {bigPicture.content}
                    </p>
                    <p 
                      className="text-sm italic"
                      style={{ color: '#043231', opacity: 0.6 }}
                    >
                      {bigPicture.note}
                    </p>
                  </CardContent>
                </Card>

                {/* How Impacts Arise */}
                <Card className="border-none shadow-lg" data-testid="card-impacts">
                  <CardContent className="p-8">
                    <h2 
                      className="text-3xl font-bold mb-6"
                      style={{ color: '#043231' }}
                    >
                      {impacts.title}
                    </h2>
                    <ul className="space-y-4">
                      {impactsList.map((item, index) => (
                        <li key={index} className="flex gap-3">
                          <CheckCircle2 
                            className="h-6 w-6 flex-shrink-0 mt-0.5" 
                            style={{ color: '#00AF67' }}
                          />
                          <div>
                            <strong style={{ color: '#043231' }}>{item.title}</strong>{' '}
                            <span style={{ color: '#043231', opacity: 0.8 }}>{item.text}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Case Studies */}
                <Card className="border-none shadow-lg" data-testid="card-case-studies">
                  <CardContent className="p-8">
                    <h2 
                      className="text-3xl font-bold mb-6"
                      style={{ color: '#043231' }}
                    >
                      {caseStudies.title}
                    </h2>
                    
                    <div className="space-y-6">
                      {caseStudiesList.map((study, index) => (
                        <div 
                          key={index}
                          className="p-4 rounded-lg"
                          style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #00AF67' }}
                        >
                          <strong 
                            className="block mb-2"
                            style={{ color: '#043231' }}
                          >
                            {study.title}
                          </strong>
                          <p 
                            className="text-sm"
                            style={{ color: '#043231', opacity: 0.8 }}
                          >
                            {study.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 7-Day Plan */}
                <Card className="border-none shadow-lg" data-testid="card-seven-days">
                  <CardContent className="p-8">
                    <h2 
                      className="text-3xl font-bold mb-8"
                      style={{ color: '#043231' }}
                    >
                      {t('checklist.planTitle')}
                    </h2>
                    
                    <div className="space-y-8">
                      {days.map((day, index) => {
                        const Icon = dayIcons[index];
                        return (
                          <div 
                            key={index}
                            className="p-6 rounded-lg"
                            style={{ backgroundColor: index % 2 === 0 ? '#f0fdf4' : '#fef3f2' }}
                            data-testid={`card-day-${index + 1}`}
                          >
                            <div className="flex items-start gap-4">
                              <div 
                                className="p-3 rounded-lg flex-shrink-0"
                                style={{ backgroundColor: '#C0FA79' }}
                              >
                                <Icon 
                                  className="h-6 w-6"
                                  style={{ color: '#043231' }}
                                />
                              </div>
                              <div className="flex-1">
                                <h3 
                                  className="text-xl font-bold mb-3"
                                  style={{ color: '#043231' }}
                                >
                                  {day.title}
                                </h3>
                                {day.why && (
                                  <div className="mb-3">
                                    <strong style={{ color: '#043231' }}>Why: </strong>
                                    <span style={{ color: '#043231', opacity: 0.8 }}>{day.why}</span>
                                  </div>
                                )}
                                {day.tips && day.tips.length > 0 && (
                                  <div className="mb-3">
                                    <strong style={{ color: '#043231' }}>{day.howTitle || 'How to do it:'}</strong>
                                    <ul className="mt-2 space-y-1 ml-4 list-disc">
                                      {day.tips.map((tip, tipIndex) => (
                                        <li key={tipIndex} style={{ color: '#043231', opacity: 0.8 }}>
                                          {tip}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {day.example && (
                                  <p className="text-sm italic" style={{ color: '#043231', opacity: 0.7 }}>
                                    <strong>Example:</strong> {day.example}
                                  </p>
                                )}
                                {day.metric && (
                                  <p className="text-sm italic" style={{ color: '#043231', opacity: 0.7 }}>
                                    <strong>Quick metric:</strong> {day.metric}
                                  </p>
                                )}
                                {day.note && (
                                  <p className="text-sm italic" style={{ color: '#043231', opacity: 0.7 }}>
                                    {day.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="md:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Quick Stats */}
                  <Card 
                    className="border-none shadow-lg"
                    style={{ backgroundColor: '#f0fdf4' }}
                    data-testid="card-quick-stats"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Lightbulb 
                          className="h-6 w-6"
                          style={{ color: '#00AF67' }}
                        />
                        <h3 
                          className="text-lg font-bold"
                          style={{ color: '#043231' }}
                        >
                          {sidebar.statsTitle}
                        </h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <strong 
                            className="block text-sm mb-1"
                            style={{ color: '#043231' }}
                          >
                            {t('checklist.sidebar.foodSystemTitle')}
                          </strong>
                          <p 
                            className="text-sm"
                            style={{ color: '#043231', opacity: 0.8 }}
                          >
                            {sidebar.foodSystem}
                          </p>
                        </div>
                        
                        <div>
                          <strong 
                            className="block text-sm mb-1"
                            style={{ color: '#043231' }}
                          >
                            {t('checklist.sidebar.foodWasteTitle')}
                          </strong>
                          <p 
                            className="text-sm"
                            style={{ color: '#043231', opacity: 0.8 }}
                          >
                            {sidebar.foodWaste}
                          </p>
                        </div>
                        
                        <p 
                          className="text-sm italic"
                          style={{ color: '#043231', opacity: 0.8 }}
                        >
                          {sidebar.useExamples}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Short Checklist */}
                  <Card 
                    className="border-none shadow-lg"
                    style={{ backgroundColor: 'white' }}
                    data-testid="card-short-checklist"
                  >
                    <CardContent className="p-6">
                      <h3 
                        className="text-lg font-bold mb-4"
                        style={{ color: '#043231' }}
                      >
                        {shortChecklist.title}
                      </h3>
                      
                      <ol className="space-y-2 list-decimal list-inside text-sm">
                        {shortChecklist.items.map((item: string, index: number) => (
                          <li 
                            key={index}
                            style={{ color: '#043231', opacity: 0.8 }}
                          >
                            {item}
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sources Section */}
        <section className="pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="border-none shadow-lg" data-testid="card-sources">
              <CardContent className="p-8">
                <h2 
                  className="text-2xl font-bold mb-4"
                  style={{ color: '#043231' }}
                >
                  {sources.title}
                </h2>
                <p 
                  className="text-sm mb-4"
                  style={{ color: '#043231', opacity: 0.7 }}
                >
                  {sources.intro}
                </p>
                <ul className="space-y-2 text-sm">
                  {sources.list.map((source: string, index: number) => (
                    <li 
                      key={index}
                      style={{ color: '#043231', opacity: 0.7 }}
                    >
                      • {source}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
