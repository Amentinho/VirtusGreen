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

  const days = t('checklist.days', { returnObjects: true }) as Array<{ title: string; body: string }>;

  const dayIcons = [Leaf, Calendar, TrendingDown, Package, MapPin, BarChart3, CheckCircle2];

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
                Practical
              </Badge>
              <Badge 
                className="text-sm font-bold px-4 py-1.5"
                style={{ backgroundColor: '#00AF67', color: 'white', border: 'none' }}
                data-testid="badge-evidence"
              >
                Evidence-backed
              </Badge>
              <Badge 
                className="text-sm font-bold px-4 py-1.5"
                style={{ backgroundColor: '#C0FA79', color: '#043231', border: 'none' }}
                data-testid="badge-actionable"
              >
                Actionable
              </Badge>
            </div>
            
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              style={{ color: '#043231' }}
              data-testid="text-hero-title"
            >
              7-Day Sustainable Eating Guide
            </h1>
            
            <p 
              className="text-xl md:text-2xl mb-4 leading-relaxed max-w-3xl mx-auto"
              style={{ color: '#043231' }}
              data-testid="text-hero-subtitle"
            >
              How food choices impact the planet (and what to do)
            </p>
            
            <p 
              className="text-lg leading-relaxed max-w-2xl mx-auto"
              style={{ color: '#043231', opacity: 0.7 }}
              data-testid="text-hero-lead"
            >
              Expanded explanations, real examples and actionable steps to reduce your environmental footprint.
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
                      Big picture: why food matters
                    </h2>
                    <p 
                      className="text-base leading-relaxed mb-3"
                      style={{ color: '#043231', opacity: 0.8 }}
                    >
                      The global food system — from farming and land-use change to processing, transport and retail — makes up a major share
                      of planetary pressure: roughly a quarter to a third of global greenhouse gas emissions depending on the accounting method.
                      Agriculture also uses a large share of freshwater and habitable land. That means changes in what and how we eat scale quickly at population level.
                    </p>
                    <p 
                      className="text-sm italic"
                      style={{ color: '#043231', opacity: 0.6 }}
                    >
                      (Key source: Our World in Data, UNEP Food Waste Index; see Sources below.)
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
                      How impacts arise (clear breakdown)
                    </h2>
                    <ul className="space-y-4">
                      {[
                        { title: 'Production emissions:', text: 'Fertiliser, animal enteric emissions, farm energy and feed production.' },
                        { title: 'Land-use change:', text: 'Clearing forests or draining peat to create pasture or cropland releases large carbon stocks.' },
                        { title: 'Processing & transport:', text: 'Refrigeration, packaging and long-distance shipping add emissions (but often less than production).' },
                        { title: 'Food waste:', text: 'When edible food is wasted, all upstream emissions and resources are effectively lost.' }
                      ].map((item, index) => (
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
                      Real-world case studies you can cite
                    </h2>
                    
                    <div className="space-y-6">
                      {[
                        {
                          title: 'Too Good To Go — surplus rescue at scale',
                          text: 'Too Good To Go is a consumer app that connects users to surplus food from retailers and restaurants. In recent impact reporting the organisation reports saving tens of millions — and in some years over 100 million — meals from going to waste. This model shows how consumer behaviour + simple tech delivers measurable waste reduction quickly.'
                        },
                        {
                          title: 'Oddbox — rescuing imperfect produce',
                          text: 'Oddbox works directly with growers to rescue \'too odd\' or surplus produce. For example, in a single reported season they rescued hundreds of tonnes of fruit that would otherwise have been wasted. The lesson: changing retail acceptance and consumer demand (buying \'ugly\' fruit) reduces farm-level loss.'
                        },
                        {
                          title: 'Walmart & IBM Food Trust — traceability to reduce uncertainty',
                          text: 'Walmart\'s traceability initiative (with IBM Food Trust/Hyperledger) required leafy-greens suppliers to register trace events, enabling rapid tracing back to farms in seconds instead of days. Better traceability reduces recall times, helps target waste reduction, and increases shopper trust in product origin.'
                        }
                      ].map((study, index) => (
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
                      7-Day Expanded Action Plan
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
                                className="p-3 rounded-lg"
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
                                <p 
                                  className="text-base leading-relaxed"
                                  style={{ color: '#043231', opacity: 0.8 }}
                                >
                                  {day.body}
                                </p>
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
                          Quick stats & talking points
                        </h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <strong 
                            className="block text-sm mb-1"
                            style={{ color: '#043231' }}
                          >
                            Food system share:
                          </strong>
                          <p 
                            className="text-sm"
                            style={{ color: '#043231', opacity: 0.8 }}
                          >
                            ~25–30% of global GHGs (used for headlines).
                          </p>
                        </div>
                        
                        <div>
                          <strong 
                            className="block text-sm mb-1"
                            style={{ color: '#043231' }}
                          >
                            Food waste:
                          </strong>
                          <p 
                            className="text-sm"
                            style={{ color: '#043231', opacity: 0.8 }}
                          >
                            1.05 billion tonnes wasted in 2022 (≈19% of available food) — households are the largest source.
                          </p>
                        </div>
                        
                        <p 
                          className="text-sm italic"
                          style={{ color: '#043231', opacity: 0.8 }}
                        >
                          Use local business examples (Too Good To Go, Oddbox, traceability pilots) to show solutions work now.
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
                        Short checklist to keep
                      </h3>
                      
                      <ol className="space-y-2 list-decimal list-inside text-sm">
                        {[
                          'Buy seasonal produce this week',
                          'Plan meals & freeze extras',
                          'Swap one meat meal for legumes',
                          'Prefer recyclable packaging',
                          'Buy local where possible',
                          'Check quick footprint indicators',
                          'Do a weekly waste audit (1 number)'
                        ].map((item, index) => (
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
                  Sources
                </h2>
                <p 
                  className="text-sm mb-4"
                  style={{ color: '#043231', opacity: 0.7 }}
                >
                  Key sources used to build the numbers and case studies (for internal verification / editorial use):
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    'Our World in Data — Environmental impacts of food & food system emissions (summary charts & comparisons).',
                    'UNEP Food Waste Index Report — 1.05 billion tonnes of food wasted in 2022 (households: ~60% of consumer-level waste).',
                    'Too Good To Go — Impact Reports (meals saved & community impact examples).',
                    'Oddbox — sustainability / rescue stories and tonnes of rescued produce.',
                    'Walmart Tech Blog / reporting on the IBM Food Trust / traceability pilot for leafy greens.'
                  ].map((source, index) => (
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
