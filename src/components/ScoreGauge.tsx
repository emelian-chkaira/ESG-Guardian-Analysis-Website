interface ScoreGaugeProps {
  score: number;
  size?: number;
}

const ScoreGauge = ({ score, size = 180 }: ScoreGaugeProps) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getVerdict = (s: number) => {
    if (s >= 80) return { label: "LOW RISK", color: "text-status-pass" };
    if (s >= 60) return { label: "MEDIUM RISK", color: "text-status-missing" };
    if (s >= 40) return { label: "HIGH RISK", color: "text-status-fail" };
    return { label: "CRITICAL", color: "text-status-fail" };
  };

  const verdict = getVerdict(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-lg">
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="8"
        />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          className="animate-score-fill"
          style={{ strokeDashoffset: offset }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(199, 89%, 48%)" />
            <stop offset="100%" stopColor="hsl(152, 60%, 36%)" />
          </linearGradient>
        </defs>
        <text x="50" y="46" textAnchor="middle" className="fill-foreground" fontSize="20" fontWeight="800">
          {score}
        </text>
        <text x="50" y="58" textAnchor="middle" className="fill-muted-foreground" fontSize="6" fontWeight="500">
          out of 100
        </text>
      </svg>
      <span className={`text-sm font-bold tracking-wide ${verdict.color}`}>
        {verdict.label}
      </span>
    </div>
  );
};

export default ScoreGauge;
