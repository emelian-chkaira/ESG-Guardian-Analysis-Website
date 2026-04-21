/**
 * ESG Validation Engine — TypeScript port of Python validator
 * Runs 100% in the browser using pdfjs-dist for text extraction
 * and regex-based rules for compliance checking.
 */
import type { RuleResult, ValidationData } from "@/types/esg";

// ─── RULES (ported from rules.py) ───

interface Rule {
  pillar: "E" | "S" | "G";
  label: string;
  keywords: string[];
  threshold: number | null;
  direction: "higher" | "lower" | "disclose";
  unit: string;
  source: string;
  source_url: string;
  mandatory: boolean;
  description: string;
}

const RULES: Record<string, Rule> = {
  scope1_emissions: {
    pillar: "E", label: "Scope 1 GHG Emissions",
    keywords: [
      "scope\\s*1[^0-9]{0,30}([\\d][,\\d]*\\.?\\d*)\\s*(t|tonnes?|tco2|tco2e|ktco2)",
      "direct\\s+emissions?[^0-9]{0,30}([\\d][,\\d]*\\.?\\d*)\\s*(t|tonnes?|tco2)",
    ],
    threshold: null, direction: "disclose", unit: "tCO2e",
    source: "ESRS E1-6 (Delegated Reg. EU 2023/2772)",
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R2772",
    mandatory: true,
    description: "Banks must disclose Scope 1 GHG emissions. No upper cap defined by law — disclosure itself is the requirement.",
  },
  scope2_emissions: {
    pillar: "E", label: "Scope 2 GHG Emissions",
    keywords: [
      "scope\\s*2[^0-9]{0,30}([\\d][,\\d]*\\.?\\d*)\\s*(t|tonnes?|tco2|tco2e|ktco2)",
      "indirect\\s+emissions?[^0-9]{0,30}([\\d][,\\d]*\\.?\\d*)\\s*(t|tonnes?|tco2)",
    ],
    threshold: null, direction: "disclose", unit: "tCO2e",
    source: "ESRS E1-6 (Delegated Reg. EU 2023/2772)",
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R2772",
    mandatory: true,
    description: "Banks must disclose Scope 2 GHG emissions (market-based or location-based).",
  },
  scope3_emissions: {
    pillar: "E", label: "Scope 3 / Financed Emissions",
    keywords: [
      "scope\\s*3[^0-9]{0,30}([\\d][,\\d]*\\.?\\d*)\\s*(t|tonnes?|tco2|tco2e|ktco2)",
      "financed\\s+emissions?[^0-9]{0,30}([\\d][,\\d]*\\.?\\d*)\\s*(t|tonnes?|tco2)",
    ],
    threshold: null, direction: "disclose", unit: "tCO2e",
    source: "ESRS E1-6 + EBA Pillar 3 Template 1 (financed emissions)",
    source_url: "https://www.eba.europa.eu/activities/reporting-and-transparency/supervisory-reporting/implementing-technical-standards-disclosure",
    mandatory: true,
    description: "Banks must disclose Scope 3 / financed emissions — this is the most material category for banks.",
  },
  net_zero_target: {
    pillar: "E", label: "Net Zero / Climate Target",
    keywords: ["net.?zero", "carbon.?neutral", "climate.?target", "paris.?agreement", "2050.{0,20}emiss"],
    threshold: null, direction: "disclose", unit: "text",
    source: "ESRS E1-1 (Climate transition plan)",
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R2772",
    mandatory: true,
    description: "Banks must disclose whether they have a net-zero or Paris-aligned climate target.",
  },
  energy_consumption: {
    pillar: "E", label: "Total Energy Consumption",
    keywords: [
      "energy\\s+consumption[^0-9]{0,40}([\\d][,\\d]*\\.?\\d*)\\s*(mwh|gwh|kwh|gj|tj)",
      "total\\s+energy[^0-9]{0,40}([\\d][,\\d]*\\.?\\d*)\\s*(mwh|gwh|kwh|gj|tj)",
    ],
    threshold: null, direction: "disclose", unit: "MWh",
    source: "ESRS E1-5 (Energy)",
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R2772",
    mandatory: true,
    description: "Total energy consumption in MWh or GJ must be disclosed.",
  },
  renewable_energy_ratio: {
    pillar: "E", label: "Renewable Energy Ratio ≥ 32%",
    keywords: [
      "renewable.{0,30}([\\d]+\\.?\\d*)\\s*%",
      "([\\d]+\\.?\\d*)\\s*%\\s*.{0,20}renewable",
      "green.{0,20}energy.{0,30}([\\d]+\\.?\\d*)\\s*%",
    ],
    threshold: 32.0, direction: "higher", unit: "%",
    source: "EU Renewable Energy Directive 2018/2001 (recast), Art. 3",
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32018L2001",
    mandatory: false,
    description: "EU-wide renewable energy target is 32% minimum. Banks should align their own energy use.",
  },
  green_asset_ratio: {
    pillar: "E", label: "Green Asset Ratio — GAR",
    keywords: [
      "green\\s+asset\\s+ratio[^0-9]{0,30}([\\d]+\\.?\\d*)\\s*%",
      "\\bgar\\b[^0-9]{0,30}([\\d]+\\.?\\d*)\\s*%",
      "taxonomy.{0,20}align.{0,30}([\\d]+\\.?\\d*)\\s*%",
    ],
    threshold: null, direction: "disclose", unit: "%",
    source: "EBA Pillar 3 ITS — Template 7 (GAR), EU Taxonomy Reg. 2020/852",
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32020R0852",
    mandatory: true,
    description: "The Green Asset Ratio (GAR) measures % of bank assets aligned with EU Taxonomy. Mandatory disclosure for all EU banks since 2023.",
  },
  btar: {
    pillar: "E", label: "BTAR (Banking Book Taxonomy Alignment)",
    keywords: [
      "\\bbtar\\b[^0-9]{0,30}([\\d]+\\.?\\d*)\\s*%",
      "banking\\s+book\\s+taxonomy[^0-9]{0,30}([\\d]+\\.?\\d*)\\s*%",
      "taxonomy\\s+alignment\\s+ratio[^0-9]{0,30}([\\d]+\\.?\\d*)\\s*%",
    ],
    threshold: null, direction: "disclose", unit: "%",
    source: "EBA Pillar 3 ITS — Template 8 (BTAR), mandatory from June 2024",
    source_url: "https://www.eba.europa.eu/activities/reporting-and-transparency/supervisory-reporting/implementing-technical-standards-disclosure",
    mandatory: true,
    description: "The BTAR extends the GAR to include counterparties not subject to NFRD/CSRD. Mandatory for all EU banks from June 2024.",
  },
  transition_risk_exposure: {
    pillar: "E", label: "Climate Transition Risk Exposure",
    keywords: [
      "transition\\s+risk[^0-9]{0,40}([\\d][,\\d]*\\.?\\d*)",
      "carbon.intensive.{0,40}([\\d][,\\d]*\\.?\\d*)",
      "high.emission\\s+sector.{0,40}([\\d][,\\d]*\\.?\\d*)",
      "fossil\\s+fuel\\s+exposure.{0,40}([\\d][,\\d]*\\.?\\d*)",
    ],
    threshold: null, direction: "disclose", unit: "€M",
    source: "EBA Pillar 3 Templates 1–4 (Transition risk banking book)",
    source_url: "https://www.eba.europa.eu/activities/reporting-and-transparency/supervisory-reporting/implementing-technical-standards-disclosure",
    mandatory: true,
    description: "Banks must disclose exposure to sectors highly exposed to climate transition risk (e.g. fossil fuels, cement, steel).",
  },
  physical_risk_exposure: {
    pillar: "E", label: "Climate Physical Risk Exposure",
    keywords: [
      "physical\\s+risk[^0-9]{0,40}([\\d][,\\d]*\\.?\\d*)",
      "flood.{0,30}(exposure|risk)[^0-9]{0,30}([\\d][,\\d]*\\.?\\d*)",
      "climate\\s+hazard[^0-9]{0,30}([\\d][,\\d]*\\.?\\d*)",
      "acute.{0,20}(risk|hazard|event)[^0-9]{0,30}([\\d][,\\d]*\\.?\\d*)",
    ],
    threshold: null, direction: "disclose", unit: "€M",
    source: "EBA Pillar 3 Template 5 (Physical risk banking book)",
    source_url: "https://www.eba.europa.eu/activities/reporting-and-transparency/supervisory-reporting/implementing-technical-standards-disclosure",
    mandatory: true,
    description: "Banks must disclose exposures subject to acute and chronic physical climate risk (floods, heat, storms).",
  },
  gender_pay_gap: {
    pillar: "S", label: "Gender Pay Gap ≤ 5%",
    keywords: [
      "gender\\s+pay\\s+gap[^0-9]{0,30}([\\d]+\\.?\\d*)\\s*%",
      "pay\\s+gap[^0-9]{0,30}([\\d]+\\.?\\d*)\\s*%",
      "wage\\s+gap[^0-9]{0,30}([\\d]+\\.?\\d*)\\s*%",
      "([\\d]+\\.?\\d*)\\s*%\\s*.{0,25}pay\\s+gap",
    ],
    threshold: 5.0, direction: "lower", unit: "%",
    source: "ESRS S1-16 (Remuneration) + EU Pay Transparency Directive 2023/970",
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023L0970",
    mandatory: true,
    description: "The EU Pay Transparency Directive requires banks to disclose and work toward closing the gender pay gap. A gap above 5% triggers mandatory joint pay assessment.",
  },
  board_gender_diversity: {
    pillar: "S", label: "Board Gender Diversity ≥ 40%",
    keywords: [
      "board.{0,30}([\\d]+\\.?\\d*)\\s*%\\s*.{0,20}(women|female|gender)",
      "(women|female|gender).{0,30}([\\d]+\\.?\\d*)\\s*%\\s*.{0,20}board",
      "board\\s+diversity.{0,30}([\\d]+\\.?\\d*)\\s*%",
      "([\\d]+\\.?\\d*)\\s*%\\s*.{0,15}(directors?\\s+are\\s+women|female\\s+directors?)",
    ],
    threshold: 40.0, direction: "higher", unit: "%",
    source: "EU Gender Balance on Corporate Boards Directive 2022/2381, Art. 5",
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022L2381",
    mandatory: true,
    description: "EU law requires at least 40% of non-executive board members to be of the under-represented gender by June 2026.",
  },
  employee_training: {
    pillar: "S", label: "Average Employee Training Hours",
    keywords: [
      "training.{0,30}([\\d]+\\.?\\d*)\\s*hours?",
      "([\\d]+\\.?\\d*)\\s*hours?.{0,20}training",
      "average.{0,20}training.{0,30}([\\d]+\\.?\\d*)",
      "learning\\s+hours?.{0,30}([\\d]+\\.?\\d*)",
    ],
    threshold: null, direction: "disclose", unit: "hours/year",
    source: "ESRS S1-13 (Training and skills development)",
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R2772",
    mandatory: true,
    description: "Average hours of training per employee per year must be disclosed under ESRS S1-13.",
  },
  employee_turnover: {
    pillar: "S", label: "Employee Turnover Rate",
    keywords: [
      "turnover\\s+rate[^0-9]{0,30}([\\d]+\\.?\\d*)\\s*%",
      "employee\\s+turnover[^0-9]{0,30}([\\d]+\\.?\\d*)\\s*%",
      "staff\\s+turnover[^0-9]{0,30}([\\d]+\\.?\\d*)\\s*%",
      "attrition[^0-9]{0,30}([\\d]+\\.?\\d*)\\s*%",
    ],
    threshold: null, direction: "disclose", unit: "%",
    source: "ESRS S1-8 (Collective bargaining and social dialogue)",
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R2772",
    mandatory: true,
    description: "Employee turnover/attrition rate must be disclosed as part of workforce data.",
  },
  work_related_injuries: {
    pillar: "S", label: "Work-Related Injuries / LTIR",
    keywords: [
      "(work.related|workplace)\\s+(injur|accident)[^0-9]{0,40}([\\d]+\\.?\\d*)",
      "ltir[^0-9]{0,30}([\\d]+\\.?\\d*)",
      "lost.time\\s+injur[^0-9]{0,30}([\\d]+\\.?\\d*)",
      "injury\\s+rate[^0-9]{0,30}([\\d]+\\.?\\d*)",
    ],
    threshold: null, direction: "disclose", unit: "rate",
    source: "ESRS S1-14 (Health and safety)",
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R2772",
    mandatory: true,
    description: "Work-related injury rate (LTIR) must be disclosed under ESRS S1-14.",
  },
  board_independence: {
    pillar: "G", label: "Board Independence ≥ 50%",
    keywords: [
      "independent.{0,30}([\\d]+\\.?\\d*)\\s*%\\s*.{0,20}(director|board|member)",
      "([\\d]+\\.?\\d*)\\s*%\\s*.{0,20}independent.{0,20}(director|board|member)",
      "board.{0,20}independence.{0,30}([\\d]+\\.?\\d*)\\s*%",
    ],
    threshold: 50.0, direction: "higher", unit: "%",
    source: "ESRS G1 + EBA Guidelines on Internal Governance (EBA/GL/2021/05), Art. 24",
    source_url: "https://www.eba.europa.eu/activities/single-rulebook/regulatory-activities/internal-governance",
    mandatory: true,
    description: "EBA governance guidelines require a majority of independent non-executive directors on bank boards.",
  },
  anti_corruption_policy: {
    pillar: "G", label: "Anti-Corruption Policy",
    keywords: ["anti.?corrup", "code\\s+of\\s+(ethics|conduct)", "bribery\\s+policy", "whistleblow", "integrity\\s+policy", "anti.?fraud\\s+policy"],
    threshold: null, direction: "disclose", unit: "text",
    source: "ESRS G1-1 (Business conduct policies and corporate culture)",
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R2772",
    mandatory: true,
    description: "Banks must disclose whether they have an anti-corruption and anti-bribery policy (ESRS G1-1).",
  },
  esg_risk_governance: {
    pillar: "G", label: "ESG Risk in Governance",
    keywords: [
      "esg.{0,20}(risk|governance|committee|oversight)",
      "sustainability.{0,20}(committee|governance|board|oversight)",
      "climate.{0,20}(risk|governance|committee)",
      "non.financial.{0,20}(risk|oversight|committee)",
    ],
    threshold: null, direction: "disclose", unit: "text",
    source: "ESRS G1 + EBA Pillar 3 — Qualitative ESG risk governance templates",
    source_url: "https://www.eba.europa.eu/activities/reporting-and-transparency/supervisory-reporting/implementing-technical-standards-disclosure",
    mandatory: true,
    description: "Banks must disclose how ESG/climate risks are integrated into their governance and risk management framework.",
  },
  remuneration_esg_link: {
    pillar: "G", label: "ESG-Linked Remuneration",
    keywords: [
      "(remuneration|compensation|bonus|pay).{0,40}(esg|sustainability|climate|green)",
      "(esg|sustainability|climate).{0,40}(remuneration|compensation|bonus|kpi)",
      "variable\\s+pay.{0,40}(esg|sustainability)",
    ],
    threshold: null, direction: "disclose", unit: "text",
    source: "ESRS G1-3 (Remuneration) + EBA Pillar 3 qualitative disclosures",
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R2772",
    mandatory: true,
    description: "Banks must disclose whether executive remuneration is linked to ESG/sustainability targets.",
  },
};

// ─── TEXT EXTRACTION ───

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await import("pdfjs-dist");
  
  // Set up worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n";
  }
  
  return fullText.toLowerCase();
}

// ─── VALUE EXTRACTION (port of Python extract_value) ───

function extractValue(text: string, patterns: string[]): { value: number | null; snippet: string | null } {
  for (const pattern of patterns) {
    const regex = new RegExp(pattern, "gi");
    const match = regex.exec(text);
    if (match) {
      // Find numeric groups
      for (let g = 1; g < match.length; g++) {
        const group = match[g];
        if (!group) continue;
        const cleaned = group.replace(/,/g, "");
        const val = parseFloat(cleaned);
        if (!isNaN(val)) {
          const start = Math.max(0, match.index - 30);
          const end = Math.min(text.length, match.index + match[0].length + 30);
          const snippet = text.slice(start, end).trim();
          return { value: val, snippet };
        }
      }
    }
  }
  return { value: null, snippet: null };
}

function checkDisclosure(text: string, patterns: string[]): { found: boolean; snippet: string | null } {
  for (const pattern of patterns) {
    const regex = new RegExp(pattern, "gi");
    const match = regex.exec(text);
    if (match) {
      const start = Math.max(0, match.index - 20);
      const end = Math.min(text.length, match.index + match[0].length + 50);
      return { found: true, snippet: text.slice(start, end).trim() };
    }
  }
  return { found: false, snippet: null };
}

// ─── RULE CHECKER ───

function checkRule(ruleId: string, rule: Rule, text: string): RuleResult {
  const result: RuleResult = {
    rule_id: ruleId,
    pillar: rule.pillar,
    label: rule.label,
    source: rule.source,
    source_url: rule.source_url,
    mandatory: rule.mandatory,
    description: rule.description,
    unit: rule.unit,
    direction: rule.direction,
    threshold: rule.threshold,
    found_value: null,
    snippet: null,
    status: "MISSING",
    flag: "⚠️",
    message: "",
  };

  if (rule.direction === "disclose") {
    const { found, snippet } = checkDisclosure(text, rule.keywords);
    result.snippet = snippet;
    if (found) {
      // Also try to extract a numeric value for display
      const { value } = extractValue(text, rule.keywords);
      if (value !== null) result.found_value = value;
      result.status = "PASS";
      result.flag = "✅";
      result.message = "Disclosed in report.";
    } else {
      result.status = "MISSING";
      result.flag = "❌";
      result.message = `NOT FOUND in report. ${rule.mandatory ? "Mandatory disclosure under " : "Recommended: "}${rule.source}`;
    }
    return result;
  }

  // Numeric threshold rules
  const { value, snippet } = extractValue(text, rule.keywords);
  result.found_value = value;
  result.snippet = snippet;

  if (value === null) {
    result.status = "MISSING";
    result.flag = "⚠️";
    result.message = `Value not found in report. Expected ${rule.direction === "higher" ? "≥" : "≤"} ${rule.threshold} ${rule.unit}. Source: ${rule.source}`;
    return result;
  }

  const passes = rule.direction === "higher" ? value >= rule.threshold! : value <= rule.threshold!;
  result.status = passes ? "PASS" : "FAIL";
  result.flag = passes ? "✅" : "❌";
  const sym = rule.direction === "higher" ? "≥" : "≤";
  result.message = `Found: ${value} ${rule.unit}. Required: ${sym} ${rule.threshold} ${rule.unit}. ${passes ? "Compliant." : "NON-COMPLIANT."}`;

  return result;
}

// ─── FULL VALIDATION ───

export async function validatePdf(file: File, onProgress?: (msg: string) => void): Promise<ValidationData> {
  onProgress?.("Extracting text from PDF...");
  const text = await extractTextFromPdf(file);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  onProgress?.(`Extracted ${wordCount.toLocaleString()} words. Running 19 rules...`);

  const results: Record<string, RuleResult> = {};
  for (const [ruleId, rule] of Object.entries(RULES)) {
    results[ruleId] = checkRule(ruleId, rule, text);
  }

  const pillars: Record<"E" | "S" | "G", RuleResult[]> = { E: [], S: [], G: [] };
  for (const r of Object.values(results)) {
    pillars[r.pillar].push(r);
  }

  const all = Object.values(results);
  const total = all.length;
  const passed = all.filter(r => r.status === "PASS").length;
  const failed = all.filter(r => r.status === "FAIL").length;
  const missing = all.filter(r => r.status === "MISSING").length;
  const mandatoryFail = all.filter(r => (r.status === "FAIL" || r.status === "MISSING") && r.mandatory).length;

  onProgress?.("Validation complete!");

  return {
    pdf_name: file.name,
    word_count: wordCount,
    results,
    pillars,
    summary: {
      total,
      passed,
      failed,
      missing,
      mandatory_fail: mandatoryFail,
      score: total ? Math.round((passed / total) * 1000) / 10 : 0,
    },
  };
}
