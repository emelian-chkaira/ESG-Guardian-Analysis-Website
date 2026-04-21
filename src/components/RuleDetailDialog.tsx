import type { RuleResult } from "@/types/esg";
import { PILLAR_NAMES } from "@/types/esg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExternalLink, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface RuleDetailDialogProps {
  rule: RuleResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RuleDetailDialog = ({ rule, open, onOpenChange }: RuleDetailDialogProps) => {
  if (!rule) return null;

  const statusClass = rule.status === "PASS" ? "status-badge-pass" : rule.status === "FAIL" ? "status-badge-fail" : "status-badge-missing";
  const StatusIcon = rule.status === "PASS" ? CheckCircle2 : rule.status === "FAIL" ? XCircle : AlertTriangle;
  const statusColor = rule.status === "PASS" ? "text-status-pass" : rule.status === "FAIL" ? "text-status-fail" : "text-status-missing";
  const pillarClass = rule.pillar === "E" ? "pillar-badge-e" : rule.pillar === "S" ? "pillar-badge-s" : "pillar-badge-g";

  const foundStr = rule.found_value !== null
    ? `${rule.found_value.toLocaleString()} ${rule.unit}`
    : rule.status === "PASS" ? "Disclosed" : "Not found";

  const reqStr = rule.direction === "disclose"
    ? (rule.mandatory ? "Must disclose" : "Recommended disclosure")
    : `${rule.direction === "higher" ? "≥" : "≤"} ${rule.threshold} ${rule.unit}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${pillarClass}`}>
              {rule.pillar} — {PILLAR_NAMES[rule.pillar]}
            </span>
            <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${statusClass}`}>
              {rule.status}
            </span>
            {rule.mandatory && (
              <span className="text-[10px] font-bold tracking-wider text-status-fail uppercase bg-status-fail/10 px-1.5 py-0.5 rounded">
                mandatory
              </span>
            )}
          </div>
          <DialogTitle className="text-lg">{rule.label}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {rule.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Result */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-lg p-3">
              <div className="text-xs text-muted-foreground font-medium mb-1">Found Value</div>
              <div className="text-sm font-bold text-foreground">{foundStr}</div>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <div className="text-xs text-muted-foreground font-medium mb-1">Requirement</div>
              <div className="text-sm font-bold text-foreground">{reqStr}</div>
            </div>
          </div>

          {/* Verdict */}
          <div className={`flex items-center gap-2 p-3 rounded-lg ${rule.status === "PASS" ? "bg-status-pass/10" : rule.status === "FAIL" ? "bg-status-fail/10" : "bg-status-missing/10"}`}>
            <StatusIcon className={`h-5 w-5 ${statusColor}`} />
            <span className={`text-sm font-semibold ${statusColor}`}>{rule.message}</span>
          </div>

          {/* Snippet */}
          {rule.snippet && (
            <div>
              <div className="text-xs text-muted-foreground font-medium mb-1">Extracted Text Snippet</div>
              <div className="bg-secondary rounded-lg p-3 text-xs font-mono text-foreground italic">
                "{rule.snippet}"
              </div>
            </div>
          )}

          {/* Legal Source */}
          <div className="border-t border-border pt-3">
            <div className="text-xs text-muted-foreground font-medium mb-1">Legal Source</div>
            <p className="text-sm text-foreground mb-2">{rule.source}</p>
            <a
              href={rule.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View official regulation
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RuleDetailDialog;
