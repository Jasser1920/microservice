interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "primary" | "success" | "warning" | "danger";
  subtitle?: string;
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
}

export default function MetricCard({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
}: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${color}`}>{icon}</div>
      <div className="metric-content">
        <h3 className="metric-title">{title}</h3>
        <div className="metric-value-wrapper">
          <p className="metric-value">{value}</p>
          {trend && (
            <span className={`metric-trend metric-trend-${trend.direction}`}>
              {trend.direction === "up" ? "↑" : "↓"}
              {trend.percentage}%
            </span>
          )}
        </div>
        {subtitle && <p className="metric-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
