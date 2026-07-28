import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import logoImage from "@assets/logo-horizontal.png";

export default function TermsOfService() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => history.back()}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Indietro
          </button>
          <button onClick={() => setLocation("/")}>
            <img src={logoImage} alt="VirtusGreen" className="h-8 w-auto object-contain" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-sm text-foreground leading-relaxed">

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Legale</p>
          <h1 className="text-3xl font-bold text-foreground">Termini di Servizio</h1>
          <p className="text-muted-foreground">Data di efficacia: 1 luglio 2026 · Ultimo aggiornamento: 28 luglio 2026</p>
        </div>

        <Section title="1. Parti e accettazione">
          <p>I presenti Termini di Servizio («Termini») regolano l'accesso e l'utilizzo della piattaforma <strong>VirtusGreen Green Agent</strong> («Servizio»), fornita da <strong>VirtusGreen S.r.l.</strong> (in costituzione), con sede in Italia («VirtusGreen», «noi»).</p>
          <p>Utilizzando il Servizio, l'utente («Produttore», «Lei») dichiara di aver letto, compreso e accettato i presenti Termini. Se si utilizza il Servizio per conto di un'organizzazione, si dichiara di avere l'autorizzazione a vincolare tale organizzazione.</p>
        </Section>

        <Section title="2. Descrizione del Servizio">
          <p>VirtusGreen Green Agent è una piattaforma SaaS che fornisce:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Verifica di provenienza IG tramite analisi di immagini satellitari Copernicus Sentinel-2 (indice NDVI, mascheratura nuvole, baseline triennale);</li>
            <li>Verifica multistrato: confine di zona denominazione, fenologia colturale, plausibilità resa/superficie;</li>
            <li>Ancoraggio su blockchain Ethereum del risultato di verifica (hash keccak256);</li>
            <li>Emissione di Passaporto Digitale del Prodotto (DPP) conforme al Regolamento UE ESPR e al Regolamento UE 2024/1143 sulle indicazioni geografiche.</li>
          </ul>
        </Section>

        <Section title="3. Account e accesso">
          <ul className="list-disc pl-5 space-y-1">
            <li>Il Produttore è responsabile della riservatezza delle proprie credenziali di accesso.</li>
            <li>Ogni account è strettamente personale e non cedibile a terzi.</li>
            <li>VirtusGreen si riserva il diritto di sospendere o terminare l'account in caso di violazione dei presenti Termini.</li>
            <li>Il Produttore deve notificare immediatamente eventuali accessi non autorizzati all'indirizzo <a href="mailto:security@virtusgreen.io" className="text-cta underline hover:no-underline">security@virtusgreen.io</a>.</li>
          </ul>
        </Section>

        <Section title="4. Dichiarazioni del Produttore">
          <p>Registrando un lotto, il Produttore dichiara e garantisce che:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>i dati inseriti (coordinate appezzamento, date di raccolta, quantità) sono veritieri e accurati;</li>
            <li>è titolare o ha il diritto di utilizzare gli appezzamenti registrati;</li>
            <li>detiene una certificazione IG valida per il prodotto dichiarato;</li>
            <li>non utilizzerà il Servizio per creare passaporti fraudolenti o fuorvianti.</li>
          </ul>
          <p className="mt-2">Dichiarazioni false costituiscono violazione grave dei presenti Termini e possono comportare responsabilità civile e penale ai sensi della normativa italiana ed europea.</p>
        </Section>

        <Section title="5. Natura del Servizio di verifica">
          <p>Il Servizio di verifica satellitare è uno <strong>strumento di screening automatizzato del rischio</strong> basato su telerilevamento. Fornisce prove a supporto della conformità IG ma <strong>non costituisce certificazione legale</strong> ai sensi del Regolamento UE 2024/1143.</p>
          <p className="mt-2">La certificazione IG definitiva rimane di competenza degli Organismi di Controllo accreditati (CSQA, DNV, Bureau Veritas, ICIM). VirtusGreen non risponde di eventuali decisioni adottate da terzi sulla base del DPP emesso.</p>
        </Section>

        <Section title="6. Proprietà intellettuale">
          <ul className="list-disc pl-5 space-y-1">
            <li>Il Servizio, inclusi software, algoritmi, interfacce e marchi, è di proprietà esclusiva di VirtusGreen.</li>
            <li>I dati inseriti dal Produttore (dati aziendali, coordinate, dati di lotto) rimangono di proprietà del Produttore.</li>
            <li>VirtusGreen può utilizzare dati aggregati e anonimi per migliorare il Servizio e per finalità di ricerca, senza identificare il singolo Produttore.</li>
            <li>I DPP emessi sono pubblicamente accessibili tramite il relativo URL e codice QR.</li>
          </ul>
        </Section>

        <Section title="7. Limitazione di responsabilità">
          <p>Nei limiti consentiti dalla legge applicabile, VirtusGreen non è responsabile per:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>danni indiretti, incidentali o consequenziali derivanti dall'uso o dall'impossibilità di utilizzare il Servizio;</li>
            <li>errori nelle immagini satellitari Copernicus (fonte: ESA/Copernicus, dati pubblici);</li>
            <li>interruzioni del Servizio dovute a manutenzione, aggiornamenti o cause di forza maggiore;</li>
            <li>decisioni di terzi (acquirenti, certific atori, autorità) basate sui DPP emessi.</li>
          </ul>
          <p className="mt-2">La responsabilità massima di VirtusGreen nei confronti del Produttore è limitata ai canoni pagati negli ultimi 12 mesi.</p>
        </Section>

        <Section title="8. Tariffe e pagamenti">
          <p>Il Servizio è attualmente disponibile in modalità <strong>beta gratuita</strong>. VirtusGreen si riserva il diritto di introdurre piani a pagamento con preavviso di almeno 30 giorni via email. Il Produttore potrà disdire l'account prima dell'entrata in vigore di qualsiasi tariffa.</p>
        </Section>

        <Section title="9. Durata e risoluzione">
          <ul className="list-disc pl-5 space-y-1">
            <li>Il contratto ha durata indeterminata e decorre dall'accettazione dei presenti Termini.</li>
            <li>Il Produttore può richiedere la cancellazione dell'account in qualsiasi momento scrivendo a <a href="mailto:privacy@virtusgreen.io" className="text-cta underline hover:no-underline">privacy@virtusgreen.io</a>.</li>
            <li>VirtusGreen può risolvere il contratto con preavviso di 30 giorni o con effetto immediato in caso di violazione grave.</li>
            <li>In caso di risoluzione, i DPP già emessi rimangono accessibili per 90 giorni, salvo diverso accordo.</li>
          </ul>
        </Section>

        <Section title="10. Legge applicabile e foro competente">
          <p>I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente in via esclusiva il Tribunale di Milano, salvo diversa disposizione inderogabile di legge applicabile al Produttore in qualità di consumatore.</p>
        </Section>

        <Section title="11. Modifiche ai Termini">
          <p>VirtusGreen può modificare i presenti Termini con preavviso di 30 giorni via email. Il proseguimento dell'utilizzo del Servizio dopo tale periodo costituisce accettazione delle modifiche.</p>
        </Section>

        <Section title="12. Contatti">
          <p>Per qualsiasi questione relativa ai presenti Termini: <a href="mailto:legal@virtusgreen.io" className="text-cta underline hover:no-underline">legal@virtusgreen.io</a></p>
        </Section>

        <div className="pt-4 border-t border-border text-xs text-muted-foreground">
          © {new Date().getFullYear()} VirtusGreen · <a href="mailto:legal@virtusgreen.io" className="text-cta underline hover:no-underline">legal@virtusgreen.io</a>
        </div>

      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-foreground border-b border-border pb-2">{title}</h2>
      <div className="space-y-2 text-sm text-foreground/80">{children}</div>
    </section>
  );
}
