import { useState } from "react";
import type { RuleResult } from "@/types/esg";
import { ExternalLink } from "lucide-react";
import RuleDetailDialog from "./RuleDetailDialog";

interface RulesTableProps {
  results: RuleResult[];
}

const RulesTable = ({ results }: RulesTableProps) => {
  const [selectedRule, setSelectedRule] = useState<RuleResult | null>(null);

  const sorted = [...results].sort((a, b) => {
    const order = { FAIL: 0, MISSING: 1, PASS: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Pillar</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Indicator</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Found</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Required</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Source</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const statusClass = r.status === "PASS" ? "status-badge-pass" : r.status === "FAIL" ? "status-badge-fail" : "status-badge-missing";
                const pillarClass = r.pillar === "E" ? "pillar-badge-e" : r.pillar === "S" ? "pillar-badge-s" : "pillar-badge-g";
                const foundStr = r.found_value !== null
                  ? `${r.found_value.toLocaleString()} ${r.unit}`
                  : r.status === "PASS" ? "Disclosed" : "—";
                const reqStr = r.direction === "disclose"
                  ? (r.mandatory ? "Must disclose" : "Recommended")
                  : `${r.direction === "higher" ? "≥" : "≤"} ${r.threshold} ${r.unit}`;

                return (
                  <tr
                    key={r.rule_id}
                    onClick={() => setSelectedRule(r)}
                    className="border-t border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${statusClass}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${pillarClass}`}>{r.pillar}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-card-foreground max-w-[240px] group-hover:text-primary transition-colors">
                      {r.label}
                      {r.mandatory && <span className="ml-1.5 text-[10px] text-status-fail font-bold uppercase">req</span>}
                    </td>
                    <td className="px-4 py-3 text-card-foreground font-mono text-xs">{foundStr}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{reqStr}</td>
                    <td className="px-4 py-3 text-xs max-w-[200px]">
                      <a
                        href={r.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {r.source.length > 40 ? r.source.slice(0, 37) + "…" : r.source}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <RuleDetailDialog
        rule={selectedRule}
        open={!!selectedRule}
        onOpenChange={(open) => { if (!open) setSelectedRule(null); }}
      />
    </>
  );
};

export default RulesTable;
