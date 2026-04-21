import { useState } from "react";
import type { RuleResult } from "@/types/esg";
import { Info, ChevronRight } from "lucide-react";
import RuleDetailDialog from "./RuleDetailDialog";

interface KeyFindingsProps {
  results: RuleResult[];
}

const KeyFindings = ({ results }: KeyFindingsProps) => {
  const [selectedRule, setSelectedRule] = useState<RuleResult | null>(null);
  const failures = results.filter(r => r.status === "FAIL");
  const highlights = results.filter(r => r.status === "PASS" && r.found_value !== null && r.direction !== "disclose");

  return (
    <>
      <div className="space-y-4">
        {failures.length > 0 && (
          <div className="bg-status-fail-light rounded-xl border border-status-fail/20 p-5">
            <h3 className="font-bold text-status-fail flex items-center gap-2 mb-3">
              <span className="text-lg">🚨</span> Non-Compliant Findings
            </h3>
            {failures.map(r => (
              <button
                key={r.rule_id}
                onClick={() => setSelectedRule(r)}
                className="w-full text-left mb-3 last:mb-0 p-3 -mx-1 rounded-lg hover:bg-status-fail/10 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm text-foreground group-hover:text-status-fail transition-colors">{r.label}</div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Found <strong>{r.found_value} {r.unit}</strong> — threshold is {r.direction === "lower" ? "≤" : "≥"} {r.threshold} {r.unit}.
                  <span className="block text-xs mt-1 italic">Source: {r.source}</span>
                </p>
              </button>
            ))}
          </div>
        )}

        {highlights.length > 0 && (
          <div className="bg-status-pass-light rounded-xl border border-status-pass/20 p-5">
            <h3 className="font-bold text-status-pass flex items-center gap-2 mb-3">
              <span className="text-lg">✅</span> Compliant Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {highlights.map(r => (
                <button
                  key={r.rule_id}
                  onClick={() => setSelectedRule(r)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-status-pass/10 transition-colors cursor-pointer group text-left"
                >
                  <Info className="h-3.5 w-3.5 text-status-pass shrink-0" />
                  <span className="text-sm text-foreground">
                    <strong>{r.found_value} {r.unit}</strong>{" "}
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                      {r.label.replace(/[≥≤]\s*\d+\.?\d*%?/, "").trim()}
                    </span>
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <RuleDetailDialog
        rule={selectedRule}
        open={!!selectedRule}
        onOpenChange={(open) => { if (!open) setSelectedRule(null); }}
      />
    </>
  );
};

export default KeyFindings;
