import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

export function riskMeta(level) {
  if (level === "HIGH") {
    return {
      label: "HIGH",
      Icon: ShieldAlert,
      text: "text-risk-high",
      solid: "bg-risk-high",
      soft: "bg-risk-high-soft",
      badge:
        "border-risk-high/30 bg-risk-high-soft text-risk-high",
    };
  }

  if (level === "MEDIUM") {
    return {
      label: "MEDIUM",
      Icon: AlertTriangle,
      text: "text-risk-medium",
      solid: "bg-risk-medium",
      soft: "bg-risk-medium-soft",
      badge:
        "border-risk-medium/30 bg-risk-medium-soft text-risk-medium",
    };
  }

  return {
    label: "LOW",
    Icon: CheckCircle2,
    text: "text-risk-low",
    solid: "bg-risk-low",
    soft: "bg-risk-low-soft",
    badge: "border-risk-low/30 bg-risk-low-soft text-risk-low",
  };
}

const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-xs gap-1.5",
};

export default function RiskBadge({
  level,
  size = "md",
  showIcon = true,
  suffix = "",
  className = "",
}) {
  const meta = riskMeta(level);
  const { Icon } = meta;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold tracking-wide ${meta.badge} ${SIZE_CLASSES[size]} ${className}`}
    >
      {showIcon && <Icon size={size === "sm" ? 11 : 13} />}
      {meta.label}
      {suffix ? ` ${suffix}` : ""}
    </span>
  );
}