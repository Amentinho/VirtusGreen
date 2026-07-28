import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import logoImage from "@assets/logo-horizontal.png";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => history.back()}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={() => setLocation("/")}>
            <img src={logoImage} alt="VirtusGreen" className="h-8 w-auto object-contain" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-sm text-foreground leading-relaxed">

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Legal</p>
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground">Effective date: 1 July 2026 · Last updated: 28 July 2026</p>
        </div>

        <Section title="1. Controller">
          <p>The data controller is <strong>VirtusGreen S.r.l.</strong> (in formation), with registered office in Italy. Contact: <a href="mailto:privacy@virtusgreen.io" className="text-cta underline hover:no-underline">privacy@virtusgreen.io</a>.</p>
        </Section>

        <Section title="2. What data we collect and why">
          <Table rows={[
            ["Full name, email, phone", "Producer account creation", "Contract performance (Art. 6(1)(b) GDPR)"],
            ["Farm name, region, GI certification number", "Linking identity to a certified geographical indication", "Contract performance"],
            ["Plot coordinates (GPS polygon)", "Satellite verification of your declared cultivation area", "Contract performance + Legitimate interest (fraud prevention)"],
            ["Password (hashed with bcrypt)", "Account authentication", "Contract performance"],
            ["Batch data (harvest dates, quantity, variety)", "Generating the Digital Product Passport", "Contract performance"],
            ["Copernicus Sentinel-2 imagery (public data)", "NDVI vegetation analysis of your plot", "Legitimate interest"],
            ["Ethereum transaction hash", "Immutable provenance record on-chain", "Legitimate interest"],
            ["Contact form submissions", "Responding to enquiries", "Legitimate interest"],
            ["Analytics (Google Analytics 4, anonymised)", "Understanding platform usage", "Legitimate interest"],
          ]} />
        </Section>

        <Section title="3. Legal bases (GDPR Art. 6)">
          <p>We process your personal data under the following legal bases:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Art. 6(1)(b)</strong> — processing necessary for the performance of a contract to which you are party (producer registration, batch verification, DPP issuance).</li>
            <li><strong>Art. 6(1)(f)</strong> — legitimate interests pursued by VirtusGreen or a third party (fraud prevention, platform security, aggregated analytics).</li>
            <li><strong>Art. 6(1)(a)</strong> — your explicit consent, where indicated at the point of collection.</li>
          </ul>
        </Section>

        <Section title="4. GI-specific processing (EU Reg. 2024/1143)">
          <p>VirtusGreen's verification service supports compliance with EU Regulation 2024/1143 on geographical indications. Plot coordinates, harvest data, and NDVI results are processed solely for provenance verification. They are not sold or licensed to third parties. Satellite imagery is sourced from the Copernicus programme (ESA/EU), which is public domain data.</p>
        </Section>

        <Section title="5. Data retention">
          <Table rows={[
            ["Producer account data", "Duration of account + 3 years after deletion request"],
            ["Batch and plot data", "7 years (EU accounting obligation) from batch creation"],
            ["Blockchain anchors (tx hash)", "Permanent — stored on public Ethereum ledger, beyond our control"],
            ["Contact form messages", "12 months"],
            ["Session cookies", "30 days (deleted on logout)"],
            ["Analytics data", "26 months (Google Analytics default)"],
          ]} twoCol />
        </Section>

        <Section title="6. Transfers outside the EU/EEA">
          <p>Some service providers operate outside the EU/EEA. We rely on Standard Contractual Clauses (SCCs) or adequacy decisions for all such transfers:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Neon (database)</strong> — EU region (Frankfurt). No transfer.</li>
            <li><strong>Resend (email)</strong> — US-based. SCCs in place.</li>
            <li><strong>Google Analytics</strong> — US-based. Adequacy decision + anonymised IPs.</li>
            <li><strong>Ethereum Sepolia / Mainnet</strong> — Decentralised, no single jurisdiction. Only non-personal hashes are anchored.</li>
          </ul>
        </Section>

        <Section title="7. Your rights">
          <p>Under GDPR you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
            <li><strong>Rectification</strong> — correct inaccurate data.</li>
            <li><strong>Erasure</strong> — request deletion, subject to legal retention obligations.</li>
            <li><strong>Restriction</strong> — ask us to pause processing while a dispute is resolved.</li>
            <li><strong>Portability</strong> — receive your data in a machine-readable format.</li>
            <li><strong>Object</strong> — object to processing based on legitimate interest.</li>
            <li><strong>Withdraw consent</strong> — where processing is based on consent, you may withdraw at any time without affecting prior processing.</li>
          </ul>
          <p className="mt-3">To exercise any right, email <a href="mailto:privacy@virtusgreen.io" className="text-cta underline hover:no-underline">privacy@virtusgreen.io</a>. We will respond within 30 days. You also have the right to lodge a complaint with your national supervisory authority (in Italy: <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-cta underline hover:no-underline">Garante Privacy</a>).</p>
        </Section>

        <Section title="8. Cookies">
          <p>We use the following cookies:</p>
          <Table rows={[
            ["Session cookie (connect.sid)", "Keeps you logged in for 30 days", "Strictly necessary"],
            ["_ga, _gid", "Google Analytics — anonymised usage stats", "Analytics (can be declined)"],
          ]} twoCol={false} threeCol />
          <p className="mt-3">You can delete cookies at any time via your browser settings.</p>
        </Section>

        <Section title="9. Security">
          <p>We implement appropriate technical and organisational measures: passwords are hashed with bcrypt (cost factor 12), all traffic is encrypted in transit (TLS 1.2+), database access is restricted by IP allowlist, and blockchain anchors store only keccak256 hashes — no personal data is written on-chain.</p>
        </Section>

        <Section title="10. Changes to this policy">
          <p>We may update this policy. Material changes will be notified by email to registered producers. The effective date at the top of this page is always current.</p>
        </Section>

        <div className="pt-4 border-t border-border text-xs text-muted-foreground">
          © {new Date().getFullYear()} VirtusGreen · <a href="mailto:privacy@virtusgreen.io" className="text-cta underline hover:no-underline">privacy@virtusgreen.io</a>
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

function Table({ rows, twoCol, threeCol }: { rows: string[][]; twoCol?: boolean; threeCol?: boolean }) {
  return (
    <div className="overflow-x-auto mt-2">
      <table className="w-full text-xs border-collapse">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-muted/40" : ""}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 align-top border border-border/50">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
