import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  CalendarDays,
  CircleDollarSign,
  Database,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useChartTheme } from "../hooks/useChartTheme";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function formatCurrency(value, compact = false) {
  if (value === null || value === undefined) return "—";

  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  if (compact) {
    if (Math.abs(number) >= 10000000) return `₹${(number / 10000000).toFixed(2)}Cr`;
    if (Math.abs(number) >= 100000) return `₹${(number / 100000).toFixed(2)}L`;
    if (Math.abs(number) >= 1000) return `₹${(number / 1000).toFixed(1)}K`;
  }

  return `₹${number.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function formatTooltipCurrency(value) {
  if (value === null || value === undefined) return "—";
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function StatCard({ title, value, description, icon: Icon, iconClass, badge, badgeClass }) {
  return (
    <div className="fs-enter rounded-2xl border border-border bg-surface p-5 transition-shadow duration-200 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
            {title}
          </p>
          <p className="mt-3 font-data text-2xl font-bold tracking-tight text-ink">
            {value}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {badge && (
              <span className={`text-xs font-semibold ${badgeClass}`}>
                {badge}
              </span>
            )}
            <span className="text-xs text-ink-faint">{description}</span>
          </div>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function LegendItem({ label, dotClass }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${dotClass}`} />
      <span className="text-[10px] text-ink-faint">{label}</span>
    </div>
  );
}

function Insight({ icon: Icon, iconClass, title, text }) {
  return (
    <div className="rounded-xl border border-border bg-canvas p-4">
      <div className="flex gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
          <Icon size={17} />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-1 text-xs leading-5 text-ink-faint">{text}</p>
        </div>
      </div>
    </div>
  );
}

function CashFlow() {
  const [cashFlow, setCashFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const chart = useChartTheme();

  useEffect(() => {
    let cancelled = false;

    async function loadCashFlow() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/cashflow`);

        if (!response.ok) {
          throw new Error(`Cash-flow API returned ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) setCashFlow(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load cash-flow data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCashFlow();
    return () => {
      cancelled = true;
    };
  }, []);

  const historicalData = cashFlow?.historical || [];
  const forecastData = cashFlow?.forecast || [];

  const historyChartData = useMemo(
    () => historicalData.map((item) => ({ month: item.short_month, outflow: item.outflow })),
    [historicalData]
  );

  const forecastChartData = useMemo(() => {
    if (!historicalData.length) {
      return forecastData.map((item) => ({
        month: item.short_month,
        actual: null,
        forecast: item.outflow,
      }));
    }

    const lastHistorical = historicalData[historicalData.length - 1];

    return [
      {
        month: lastHistorical.short_month,
        actual: lastHistorical.outflow,
        forecast: lastHistorical.outflow,
      },
      ...forecastData.map((item) => ({
        month: item.short_month,
        actual: null,
        forecast: item.outflow,
      })),
    ];
  }, [historicalData, forecastData]);

  const insights = useMemo(() => {
    if (!cashFlow) return [];

    const average = Number(cashFlow.average_monthly_outflow) || 0;
    const latest = Number(cashFlow.latest_month_outflow) || 0;
    const forecast = Number(cashFlow.forecast_monthly_outflow) || 0;

    const result = [];

    if (latest > average) {
      result.push({
        icon: TrendingUp,
        iconClass: "bg-risk-high-soft text-risk-high",
        title: "Outflow above average",
        text: `The latest month's transaction outflow is ${formatCurrency(
          latest - average,
          true
        )} above the historical monthly average.`,
      });
    } else {
      result.push({
        icon: TrendingDown,
        iconClass: "bg-risk-low-soft text-risk-low",
        title: "Outflow below average",
        text: "The latest month's transaction outflow is below the historical monthly average.",
      });
    }

    if (forecast > latest) {
      result.push({
        icon: TrendingUp,
        iconClass: "bg-risk-medium-soft text-risk-medium",
        title: "Forecast indicates higher outflow",
        text: `The moving-average forecast is ${formatCurrency(
          forecast - latest,
          true
        )} above the latest observed month.`,
      });
    } else {
      result.push({
        icon: TrendingDown,
        iconClass: "bg-accent-soft text-accent",
        title: "Forecast indicates lower outflow",
        text: "The projected monthly transaction outflow is below the latest observed month.",
      });
    }

    result.push({
      icon: Database,
      iconClass: "bg-accent-soft text-accent",
      title: "Evidence-based forecast",
      text: "Forecast values use the latest three observed months and a transparent moving-average method.",
    });

    return result;
  }, [cashFlow]);

  const tooltipStyle = {
    background: chart.surface2,
    border: `1px solid ${chart.border}`,
    borderRadius: "12px",
    color: chart.ink,
    fontSize: "13px",
  };

  const labelStyle = { color: chart.inkMuted, marginBottom: "4px" };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-3 h-3 w-40 animate-pulse rounded bg-surface-2" />
          <div className="h-9 w-56 animate-pulse rounded bg-surface-2" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-surface-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>

        <div className="mt-6 h-96 animate-pulse rounded-2xl border border-border bg-surface" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Financial Forecasting
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Cash Flow
          </h1>
        </div>

        <div className="rounded-2xl border border-risk-high/25 bg-risk-high-soft p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-surface p-3 text-risk-high">
              <CircleDollarSign size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-ink">
                Unable to load cash-flow data
              </h2>
              <p className="mt-2 text-sm text-ink-muted">{error}</p>
              <p className="mt-3 text-xs text-ink-faint">
                Make sure the FinSight FastAPI backend is running on port
                8000.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Financial Forecasting
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Cash Flow
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
            Analyze real transaction outflow and estimate future cash
            pressure using historical patterns.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink-muted">
          <CalendarDays size={16} />
          Historical + 3-Month Forecast
        </div>
      </div>

      {/* Live data badge */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-risk-low/20 bg-risk-low-soft px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-risk-low">
          <Database size={16} />
        </div>
        <div>
          <p className="text-xs font-semibold text-risk-low">
            LIVE FINANCIAL DATA
          </p>
          <p className="mt-0.5 text-xs text-ink-faint">
            Cash-flow calculations are generated from the FinSight
            transaction dataset.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Outflow"
          value={formatCurrency(cashFlow?.total_outflow, true)}
          description="Observed transactions"
          icon={Wallet}
          iconClass="bg-accent-soft text-accent"
          badge="Dataset"
          badgeClass="text-accent"
        />
        <StatCard
          title="Latest Outflow"
          value={formatCurrency(cashFlow?.latest_month_outflow, true)}
          description="Latest observed month"
          icon={ArrowDownRight}
          iconClass="bg-risk-high-soft text-risk-high"
          badge="Actual"
          badgeClass="text-risk-high"
        />
        <StatCard
          title="Monthly Average"
          value={formatCurrency(cashFlow?.average_monthly_outflow, true)}
          description="Historical average"
          icon={CircleDollarSign}
          iconClass="bg-signal-soft text-signal"
          badge="Historical"
          badgeClass="text-signal"
        />
        <StatCard
          title="Forecast Outflow"
          value={formatCurrency(cashFlow?.forecast_monthly_outflow, true)}
          description="Expected monthly level"
          icon={TrendingUp}
          iconClass="bg-risk-medium-soft text-risk-medium"
          badge="3-month average"
          badgeClass="text-risk-medium"
        />
      </div>

      {/* Historical chart */}
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Transaction Outflow History
            </h2>
            <p className="mt-1 text-xs text-ink-faint">
              Monthly transaction amounts observed in the financial dataset
            </p>
          </div>

          <LegendItem label="Observed Outflow" dotClass="bg-risk-high" />
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historyChartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                stroke={chart.border}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: chart.inkFaint, fontSize: 11 }}
              />
              <YAxis
                tickFormatter={(value) => `₹${Math.round(value / 100000)}L`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: chart.inkFaint, fontSize: 11 }}
              />
              <Tooltip
                formatter={(value) => formatTooltipCurrency(value)}
                contentStyle={tooltipStyle}
                labelStyle={labelStyle}
              />
              <Line
                type="monotone"
                dataKey="outflow"
                name="Outflow"
                stroke={chart.riskHigh}
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast + Insights */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-6 xl:col-span-2">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-ink">
                  Cash Outflow Forecast
                </h2>
                <span className="rounded-md border border-accent/25 bg-accent-soft px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-accent">
                  Forecast
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-faint">
                Projected transaction outflow using a transparent 3-month
                moving average
              </p>
            </div>

            <TrendingUp size={19} className="text-accent" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={forecastChartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chart.accent} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={chart.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke={chart.border}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: chart.inkFaint, fontSize: 11 }}
                />
                <YAxis
                  tickFormatter={(value) => `₹${Math.round(value / 100000)}L`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: chart.inkFaint, fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value) => formatTooltipCurrency(value)}
                  contentStyle={tooltipStyle}
                  labelStyle={labelStyle}
                />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  name="Forecast"
                  stroke={chart.accent}
                  strokeWidth={3}
                  fill="url(#forecastFill)"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Latest Actual"
                  stroke={chart.riskLow}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 rounded-xl border border-accent/15 bg-accent-soft p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-accent">
                <Database size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-accent">
                  Transparent forecasting method
                </p>
                <p className="mt-1 text-xs leading-5 text-ink-muted">
                  The forecast uses the average transaction outflow from the
                  latest three observed months. No artificial inflow or
                  net-cash-flow values are generated.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-ink">
            Cash Flow Insights
          </h2>
          <p className="mt-1 text-xs text-ink-faint">
            Evidence-based observations from transaction activity
          </p>

          <div className="mt-6 space-y-4">
            {insights.map((insight, index) => (
              <Insight
                key={index}
                icon={insight.icon}
                iconClass={insight.iconClass}
                title={insight.title}
                text={insight.text}
              />
            ))}
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
              Data Coverage
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">
                {historicalData.length} months
              </span>
              <span className="text-xs text-risk-low">Live</span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-risk-low" style={{ width: "100%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Dataset limitation notice */}
      <div className="mt-6 rounded-2xl border border-risk-medium/20 bg-risk-medium-soft p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-surface p-2 text-risk-medium">
            <ArrowDownRight size={17} />
          </div>
          <div>
            <p className="text-sm font-semibold text-risk-medium">
              Dataset limitation
            </p>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              The current financial dataset contains transaction amounts and
              dates but does not identify separate cash inflows. Therefore,
              this module reports observed transaction outflow and forecasts
              future outflow without fabricating balance, inflow, or
              net-cash-flow values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CashFlow;