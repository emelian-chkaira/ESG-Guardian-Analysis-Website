export interface RuleResult {
  rule_id: string;
  pillar: "E" | "S" | "G";
  label: string;
  source: string;
  source_url: string;
  mandatory: boolean;
  description: string;
  unit: string;
  direction: "higher" | "lower" | "disclose";
  threshold: number | null;
  found_value: number | null;
  snippet: string | null;
  status: "PASS" | "FAIL" | "MISSING";
  flag: string;
  message: string;
}

export interface ValidationSummary {
  total: number;
  passed: number;
  failed: number;
  missing: number;
  mandatory_fail: number;
  score: number;
}

export interface ValidationData {
  pdf_name: string;
  word_count: number;
  results: Record<string, RuleResult>;
  pillars: Record<"E" | "S" | "G", RuleResult[]>;
  summary: ValidationSummary;
}

export const PILLAR_NAMES: Record<string, string> = {
  E: "Environmental",
  S: "Social",
  G: "Governance",
};

export const PILLAR_SUBTITLES: Record<string, string> = {
  E: "ESRS E1 + EBA Pillar 3",
  S: "ESRS S1 + EU Directives",
  G: "ESRS G1 + EBA Governance",
};

export interface LegalFramework {
  id: string;
  name: string;
  shortName: string;
  description: string;
  url: string;
  pillar: "E" | "S" | "G" | "all";
  rules: string[];
}

export const LEGAL_FRAMEWORKS: LegalFramework[] = [
  {
    id: "esrs",
    name: "EU Delegated Regulation 2023/2772 — ESRS E1/S1/G1",
    shortName: "ESRS",
    description: "European Sustainability Reporting Standards under CSRD. Covers environmental (E1), social (S1) and governance (G1) disclosure requirements for large undertakings and listed companies.",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R2772",
    pillar: "all",
    rules: ["scope1_emissions", "scope2_emissions", "scope3_emissions", "net_zero_target", "energy_consumption", "gender_pay_gap", "board_gender_diversity", "employee_training", "employee_turnover", "work_related_injuries", "board_independence", "anti_corruption_policy", "esg_risk_governance", "remuneration_esg_link"],
  },
  {
    id: "eba_pillar3",
    name: "EBA/ITS/2022/01 — Pillar 3 ESG Risk Disclosures (updated 2024)",
    shortName: "EBA Pillar 3",
    description: "Implementing Technical Standards on ESG risk disclosures for credit institutions. Templates 1–8 covering climate transition risk, physical risk, GAR, and BTAR.",
    url: "https://www.eba.europa.eu/activities/reporting-and-transparency/supervisory-reporting/implementing-technical-standards-disclosure",
    pillar: "all",
    rules: ["scope3_emissions", "green_asset_ratio", "btar", "transition_risk_exposure", "physical_risk_exposure", "board_independence", "esg_risk_governance", "remuneration_esg_link"],
  },
  {
    id: "taxonomy",
    name: "EU Taxonomy Regulation 2020/852",
    shortName: "EU Taxonomy",
    description: "Framework for classifying environmentally sustainable economic activities. Defines the Green Asset Ratio (GAR) and Banking Book Taxonomy Alignment Ratio (BTAR).",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32020R0852",
    pillar: "E",
    rules: ["green_asset_ratio", "btar"],
  },
  {
    id: "gender_balance",
    name: "EU Gender Balance Directive 2022/2381",
    shortName: "Gender Balance Dir.",
    description: "Requires listed companies to have ≥ 40% of the under-represented gender among non-executive directors, or ≥ 33% among all directors, by 30 June 2026.",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022L2381",
    pillar: "S",
    rules: ["board_gender_diversity"],
  },
  {
    id: "pay_transparency",
    name: "EU Pay Transparency Directive 2023/970",
    shortName: "Pay Transparency Dir.",
    description: "Requires employers to report gender pay gaps. A gap exceeding 5% triggers a mandatory joint pay assessment with worker representatives.",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023L0970",
    pillar: "S",
    rules: ["gender_pay_gap"],
  },
  {
    id: "renewable_energy",
    name: "EU Renewable Energy Directive 2018/2001 (recast)",
    shortName: "RED II",
    description: "Sets EU-wide target for renewable energy share. Current target is at least 32% of gross final energy consumption from renewable sources.",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32018L2001",
    pillar: "E",
    rules: ["renewable_energy_ratio"],
  },
];
