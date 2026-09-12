import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAnomalies } from "../hooks/useAnomalies";
import { useChartTheme } from "../hooks/useChartTheme";
import RiskBadge, { riskMeta } from "../components/RiskBadge";
import CountUp from "../components/CountUp";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function StatCard({ label, value, description, icon: Icon, tone }) {
  const tones = {
    signal: { icon: "bg-signal-soft text-signal", value: "text-ink" },
    high: { icon: "bg-risk-high-soft text-risk-high", value: "text-risk-high" },
    medium: {
      icon: "bg-risk-medium-soft text-risk-medium",
      value: "text-risk-medium",
    },
    accent: { icon: "bg-accent-soft text-accent", value: "text-ink" },
  };

  const t = tones[tone] || tones.accent;

  return (
    <div className="fs-enter rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
            {label}
          </p>
          <p className={`mt-3 font-data text-3xl font-bold ${t.value}`}>
            {value}
          </p>
          <p className="mt-1.5 text-xs text-ink-faint">{description}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.icon}`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export default function Overview() {
  const { anomalies, loading, error, stats, reload } = useAnomalies();
  const chart = useChartTheme();

  const riskData = useMemo(
    () => [
      { name: "High", value: stats.highCount, fill: chart.riskHigh },
      { name: "Medium", value: stats.mediumCount, fill: chart.riskMedium },
      { name: "Low", value: stats.lowCount, fill: chart.riskLow },
    ],
    [stats, chart]
  );

  const amountData = useMemo(
    () =>
      [...anomalies]
        .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
        .map((item) => ({
          invoice: item.invoice_id,
          amount: Number(item.amount || 0),
        })),
    [anomalies]
  );

  const recentCases = useMemo(
    () =>
      [...anomalies]
        .sort((a, b) => {
          if (a.risk_level === "HIGH" && b.risk_level !== "HIGH") return -1;
          if (a.risk_level !== "HIGH" && b.risk_level === "HIGH") return 1;
          return Number(b.amount || 0) - Number(a.amount || 0);
        })
        .slice(0, 5),
    [anomalies]
  );

  const tooltipStyle = {
    background: chart.surface2,
    border: `1px solid ${chart.border}`,
    borderRadius: "12px",
    color: chart.ink,
    fontSize: "13px",
  };

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-signal">
            <ShieldAlert size={16} />
            Financial Intelligence Summary
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
            From anomaly detection to evidence-backed financial
            investigation — the state of things right now.
          </p>
        </div>

        <button
          onClick={reload}
          disabled={loading}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:border-border-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh overview
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-risk-high/20 bg-risk-high-soft p-4">
          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0 text-risk-high"
          />
          <div>
            <p className="font-medium text-risk-high">
              FinSight backend is unavailable
            </p>
            <p className="mt-1 text-sm text-ink-muted">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-border bg-surface"
              />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-2xl border border-border bg-surface" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Flagged Transactions"
              value={<CountUp value={stats.total} />}
              description="Live anomaly results"
              icon={FileSearch}
              tone="signal"
            />
            <StatCard
              label="High Risk Cases"
              value={<CountUp value={stats.highCount} />}
              description="Priority investigation"
              icon={ShieldAlert}
              tone="high"
            />
            <StatCard
              label="Medium Risk"
              value={<CountUp value={stats.mediumCount} />}
              description="Analyst review"
              icon={TrendingUp}
              tone="medium"
            />
            <StatCard
              label="Flagged Value"
              value={formatCurrency(stats.flaggedValue)}
              description="Combined anomaly amount"
              icon={WalletCards}
              tone="accent"
            />
          </div>

          {/* Main charts */}
          <div className="mb-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <section className="rounded-2xl border border-border bg-surface p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={19} className="text-signal" />
                    <h2 className="font-semibold text-ink">
                      Flagged Transaction Value
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-ink-faint">
                    Amount by live anomaly case
                  </p>
                </div>

                <span className="flex items-center gap-1.5 rounded-full border border-signal/25 bg-signal-soft px-3 py-1 text-xs font-semibold text-signal">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
                  LIVE
                </span>
              </div>

              {amountData.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-ink-faint">
                  No anomaly data available.
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={amountData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid
                        stroke={chart.border}
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="invoice"
                        tick={{ fill: chart.inkFaint, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: chart.inkFaint, fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${Math.round(v / 1000)}K`}
                      />
                      <Tooltip
                        cursor={{ fill: chart.surfaceHover }}
                        contentStyle={tooltipStyle}
                        formatter={(value) => [
                          formatCurrency(value),
                          "Amount",
                        ]}
                      />
                      <Bar
                        dataKey="amount"
                        fill={chart.accent}
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-surface p-6">
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={19} className="text-signal" />
                  <h2 className="font-semibold text-ink">
                    Risk Distribution
                  </h2>
                </div>
                <p className="mt-1 text-sm text-ink-faint">
                  Current anomaly severity
                </p>
              </div>

              {stats.total === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-ink-faint">
                  No risk data available.
                </div>
              ) : (
                <>
                  <div className="relative h-[235px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={92}
                          paddingAngle={4}
                          stroke={chart.surface}
                          strokeWidth={3}
                        >
                          {riskData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="font-data text-3xl font-bold text-ink">
                          {stats.total}
                        </p>
                        <p className="text-xs text-ink-faint">Cases</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-risk-high-soft p-3 text-center">
                      <p className="font-data text-lg font-bold text-risk-high">
                        {stats.highCount}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-ink-faint">
                        High
                      </p>
                    </div>
                    <div className="rounded-xl bg-risk-medium-soft p-3 text-center">
                      <p className="font-data text-lg font-bold text-risk-medium">
                        {stats.mediumCount}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-ink-faint">
                        Medium
                      </p>
                    </div>
                    <div className="rounded-xl bg-risk-low-soft p-3 text-center">
                      <p className="font-data text-lg font-bold text-risk-low">
                        {stats.lowCount}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-ink-faint">
                        Low
                      </p>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>

          {/* Recent investigations */}
          <section className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex flex-col justify-between gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <FileSearch size={19} className="text-signal" />
                  <h2 className="font-semibold text-ink">
                    Recent Investigations
                  </h2>
                </div>
                <p className="mt-1 text-sm text-ink-faint">
                  Highest-priority cases from the anomaly engine
                </p>
              </div>

              <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-ink-muted">
                {recentCases.length} CASES
              </span>
            </div>

            {recentCases.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2
                  size={32}
                  className="mx-auto mb-3 text-risk-low"
                />
                <p className="font-medium text-ink">No anomalies detected</p>
                <p className="mt-1 text-sm text-ink-faint">
                  FinSight currently has no flagged cases.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentCases.map((item) => {
                  const meta = riskMeta(item.risk_level);
                  const Icon = meta.Icon;

                  return (
                    <div
                      key={item.invoice_id}
                      className="flex flex-col gap-4 px-5 py-5 transition-colors duration-150 hover:bg-surface-hover sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-4">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.soft}`}
                        >
                          <Icon size={18} className={meta.text} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-data font-semibold text-ink">
                              {item.invoice_id}
                            </p>
                            <RiskBadge level={item.risk_level} size="sm" />
                          </div>

                          <p className="mt-1 text-sm text-ink-muted">
                            {item.vendor_id}
                          </p>

                          <p className="mt-2 line-clamp-1 text-xs text-ink-faint">
                            {item.reasons?.[0] || "Anomaly detected"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-5 sm:justify-end">
                        <div className="text-left sm:text-right">
                          <p className="font-data font-semibold text-ink">
                            {formatCurrency(item.amount)}
                          </p>
                          <p className="mt-1 text-xs text-ink-faint">
                            Flagged amount
                          </p>
                        </div>

                        <ArrowRight size={17} className="text-ink-faint" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Architecture note */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-surface p-5">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-signal" />
            <div>
              <p className="text-sm font-semibold text-ink">
                Evidence-first intelligence
              </p>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                FinSight calculates financial anomalies deterministically
                from backend data. Gemini is used after evidence collection
                to explain the investigation and recommend analyst action.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}