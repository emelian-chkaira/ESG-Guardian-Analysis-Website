import { useState, useCallback } from "react";
import Header from "@/components/Header";
import ScoreGauge from "@/components/ScoreGauge";
import SummaryStats from "@/components/SummaryStats";
import PillarCard from "@/components/PillarCard";
import KeyFindings from "@/components/KeyFindings";
import RulesTable from "@/components/RulesTable";
import PdfUpload from "@/components/PdfUpload";
import LegalFrameworks from "@/components/LegalFrameworks";
import { BANCO_BPM_DATA } from "@/data/sampleData";
import type { ValidationData } from "@/types/esg";
import { FileText, Database, Scale } from "lucide-react";

const Index = () => {
  const [data, setData] = useState<ValidationData>(BANCO_BPM_DATA);

  const handleValidation = useCallback((newData: ValidationData) => {
    setData(newData);
  }, []);

  const allResults = Object.values(data.results);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Bank info bar */}
        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground animate-fade-up">
          <span className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            {data.pdf_name}
          </span>
          <span className="flex items-center gap-1.5">
            <Database className="h-4 w-4" />
            {data.word_count.toLocaleString()} words extracted
          </span>
          <span className="flex items-center gap-1.5">
            <Scale className="h-4 w-4" />
            19 rules · 6 legal frameworks
          </span>
        </div>

        {/* PDF Upload + Score row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <PdfUpload onValidationComplete={handleValidation} />
          <div className="flex flex-col items-center bg-card rounded-xl border border-border p-6 shadow-sm">
            <ScoreGauge score={data.summary.score} />
            <p className="text-xs text-muted-foreground mt-2 text-center max-w-[160px]">
              Compliance Score
            </p>
          </div>
        </div>

        {/* Stats + Findings */}
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <SummaryStats summary={data.summary} />
          <KeyFindings results={allResults} />
        </div>

        {/* Pillar Cards */}
        <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-xl font-bold text-foreground mb-1">Pillar Breakdown</h2>
          <p className="text-sm text-muted-foreground mb-4">Click any rule to see full details, legal source, and extracted snippet.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <PillarCard pillar="E" results={data.pillars.E} />
            <PillarCard pillar="S" results={data.pillars.S} />
            <PillarCard pillar="G" results={data.pillars.G} />
          </div>
        </section>

        {/* Legal Frameworks */}
        <div className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
          <LegalFrameworks />
        </div>

        {/* Full Table */}
        <section id="report" className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-xl font-bold text-foreground mb-1">All Rules — Detailed View</h2>
          <p className="text-sm text-muted-foreground mb-4">Click any row to see full rule details. Source links open the official regulation.</p>
          <RulesTable results={allResults} />
        </section>

        {/* Methodology */}
        <section id="methodology" className="animate-fade-up bg-card rounded-xl border border-border p-6 shadow-sm" style={{ animationDelay: "0.4s" }}>
          <h2 className="text-xl font-bold text-foreground mb-3">Methodology</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-2">
            <p>
              This validator applies <strong>19 rules</strong> derived from EU regulatory frameworks to sustainability reports published by Italian banks.
              Each rule specifies regex keyword patterns, a compliance direction (higher/lower/disclose), and a legal threshold sourced from:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>ESRS E1/S1/G1</strong> — <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R2772" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">EU Delegated Regulation 2023/2772</a></li>
              <li><strong>EBA Pillar 3 ITS</strong> — <a href="https://www.eba.europa.eu/activities/reporting-and-transparency/supervisory-reporting/implementing-technical-standards-disclosure" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">EBA/ITS/2022/01 (updated 2024)</a></li>
              <li><strong>EU Taxonomy Regulation</strong> — <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32020R0852" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">2020/852</a></li>
              <li><strong>EU Gender Balance Directive</strong> — <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022L2381" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">2022/2381</a></li>
              <li><strong>EU Pay Transparency Directive</strong> — <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023L0970" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">2023/970</a></li>
              <li><strong>EU Renewable Energy Directive</strong> — <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32018L2001" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">2018/2001 (recast)</a></li>
            </ul>
            <p>
              The tool is 100% client-side — no AI, no API calls. PDF text is extracted with <code>pdf.js</code> in the browser, then each rule's regex patterns
              are matched against the full text. Numeric values are compared against thresholds; disclosure-only rules check for topic presence.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground py-6 border-t border-border">
          MSc ETAA — University of Parma (2025–2026) · Topic D: AI-Driven ESG Accountability under CSRD for Italian Regional Banks
        </footer>
      </main>
    </div>
  );
};

export default Index;
