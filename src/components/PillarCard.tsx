import { PILLAR_NAMES, PILLAR_SUBTITLES, type RuleResult } from "@/types/esg";
import { CheckCircle2, XCircle, AlertTriangle, ChevronRight } from "lucide-react";
import { useState } from "react";
import RuleDetailDialog from "./RuleDetailDialog";

interface PillarCardProps {
  pillar: "E" | "S" | "G";
  results: RuleResult[];
}

const PILLAR_ICONS: Record<string, string> = {
  E: "🌿",
  S: "👥",
  G: "🏛️",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "PASS") return <CheckCircle2 className="h-4 w-4 text-status-pass shrink-0" />;
  if (status === "FAIL") return <XCircle className="h-4 w-4 text-status-fail shrink-0" />;
  return <AlertTriangle className="h-4 w-4 text-status-missing shrink-0" />;
};

const PillarCard = ({ pillar, results }: PillarCardProps) => {
  const [selectedRule, setSelectedRule] = useState<RuleResult | null>(null);
  const passed = results.filter(r => r.status === "PASS").length;
  const total = results.length;
  const pillarScore = total > 0 ? Math.round((passed / total) * 100) : 0;

  const badgeClass = pillar === "E" ? "pillar-badge-e" : pillar === "S" ? "pillar-badge-s" : "pillar-badge-g";
  const borderClass = pillar === "E" ? "border-pillar-e/30" : pillar === "S" ? "border-pillar-s/30" : "border-pillar-g/30";

  const sortedResults = [...results].sort((a, b) => {
    const order = { FAIL: 0, MISSING: 1, PASS: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  return (
    <>
      <div className={`bg-card rounded-xl border ${borderClass} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{PILLAR_ICONS[pillar]}</span>
              <h3 className="font-bold text-lg text-card-foreground">{PILLAR_NAMES[pillar]}</h3>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeClass}`}>
              {passed}/{total}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{PILLAR_SUBTITLES[pillar]}</p>
          <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                pillar === "E" ? "bg-pillar-e" : pillar === "S" ? "bg-pillar-s" : "bg-pillar-g"
              }`}
              style={{ width: `${pillarScore}%` }}
            />
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="space-y-0">
            {sortedResults.map((r) => (
              <button
                key={r.rule_id}
                onClick={() => setSelectedRule(r)}
                className="w-full flex items-start gap-2.5 py-2.5 px-2 -mx-2 border-t border-border/50 first:border-t-0 rounded-lg hover:bg-secondary/60 transition-colors text-left group cursor-pointer"
              >
                <StatusIcon status={r.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-card-foreground leading-tight group-hover:text-primary transition-colors">
                      {r.label}
                    </span>
                    {r.mandatory && (
                      <span className="text-[10px] font-bold tracking-wider text-status-fail uppercase">
                        mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {r.found_value !== null && r.direction !== "disclose" ? (
                      <>
                        Found: <strong>{r.found_value} {r.unit}</strong>
                        {r.threshold !== null && (
                          <> · Required: {r.direction === "higher" ? "≥" : "≤"} {r.threshold} {r.unit}</>
                        )}
                      </>
                    ) : r.found_value !== null ? (
                      <>Value: <strong>{r.found_value.toLocaleString()} {r.unit}</strong></>
                    ) : (
                      r.status === "PASS" ? "Disclosed ✓" : r.message
                    )}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
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

export default PillarCard;
