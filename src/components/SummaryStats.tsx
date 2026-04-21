import type { ValidationSummary } from "@/types/esg";
import { CheckCircle2, XCircle, AlertTriangle, ShieldAlert } from "lucide-react";

interface SummaryStatsProps {
  summary: ValidationSummary;
}

const SummaryStats = ({ summary }: SummaryStatsProps) => {
  const stats = [
    { label: "Rules Checked", value: summary.total, icon: <ShieldAlert className="h-5 w-5 text-primary" />, color: "text-foreground" },
    { label: "Passed", value: summary.passed, icon: <CheckCircle2 className="h-5 w-5 text-status-pass" />, color: "text-status-pass" },
    { label: "Failed", value: summary.failed, icon: <XCircle className="h-5 w-5 text-status-fail" />, color: "text-status-fail" },
    { label: "Missing", value: summary.missing, icon: <AlertTriangle className="h-5 w-5 text-status-missing" />, color: "text-status-missing" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 shadow-sm"
        >
          <div className="p-2 rounded-lg bg-secondary">
            {stat.icon}
          </div>
          <div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryStats;
