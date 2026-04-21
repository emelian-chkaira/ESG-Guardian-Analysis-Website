import { LEGAL_FRAMEWORKS } from "@/types/esg";
import { ExternalLink, Scale, ChevronDown } from "lucide-react";
import { useState } from "react";

const PILLAR_EMOJI: Record<string, string> = {
  E: "🌿",
  S: "👥",
  G: "🏛️",
  all: "📜",
};

const LegalFrameworks = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section id="legal" className="animate-fade-up bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 pb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Legal Frameworks & Rule Definitions
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Click any framework to see details and the official regulation link.
        </p>
      </div>

      <div className="px-6 pb-6 space-y-2">
        {LEGAL_FRAMEWORKS.map((fw) => {
          const isExpanded = expandedId === fw.id;
          return (
            <div
              key={fw.id}
              className="border border-border rounded-lg overflow-hidden transition-all hover:border-primary/30"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : fw.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors"
              >
                <span className="text-lg">{PILLAR_EMOJI[fw.pillar]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{fw.shortName}</div>
                  <div className="text-xs text-muted-foreground truncate">{fw.name}</div>
                </div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                  {fw.rules.length} rules
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border bg-secondary/30">
                  <p className="text-sm text-foreground mt-3 leading-relaxed">{fw.description}</p>
                  <div className="mt-3 flex items-center gap-4 flex-wrap">
                    <a
                      href={fw.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline bg-primary/10 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View official regulation
                    </a>
                    <span className="text-xs text-muted-foreground">
                      Pillar: {fw.pillar === "all" ? "E / S / G" : fw.pillar}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground font-medium mb-1.5">Rules covered:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {fw.rules.map((ruleId) => (
                        <span key={ruleId} className="text-[11px] bg-secondary text-muted-foreground px-2 py-0.5 rounded font-mono">
                          {ruleId}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LegalFrameworks;
