import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileSearch,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
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

import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function riskClass(level) {
  if (level === "HIGH") {
    return "border-red-500/30 bg-red-500/10 text-red-400";
  }

  if (level === "MEDIUM") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  }

  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
}

function riskIcon(level) {
  if (level === "HIGH") return <ShieldAlert size={15} />;
  if (level === "MEDIUM") return <AlertTriangle size={15} />;
  return <CheckCircle2 size={15} />;
}

function Dashboard() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(`${API_BASE}/anomalies`);

      if (!response.ok) {
        throw new Error("Unable to load anomaly data.");
      }

      const data = await response.json();

      setAnomalies(Array.isArray(data.anomalies) ? data.anomalies : []);
    } catch (err) {
      setError(
        "Unable to connect to the FinSight backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const highRisk = useMemo(
    () => anomalies.filter((item) => item.risk_level === "HIGH"),
    [anomalies]
  );

  const mediumRisk = useMemo(
    () => anomalies.filter((item) => item.risk_level === "MEDIUM"),
    [anomalies]
  );

  const lowRisk = useMemo(
    () => anomalies.filter((item) => item.risk_level === "LOW"),
    [anomalies]
  );

  const flaggedValue = useMemo(
    () =>
      anomalies.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      ),
    [anomalies]
  );

  const largestCase = useMemo(() => {
    if (!anomalies.length) return null;

    return [...anomalies].sort(
      (a, b) => Number(b.amount || 0) - Number(a.amount || 0)
    )[0];
  }, [anomalies]);

  const riskData = [
    {
      name: "High",
      value: highRisk.length,
      fill: "#ef4444",
    },
    {
      name: "Medium",
      value: mediumRisk.length,
      fill: "#f59e0b",
    },
    {
      name: "Low",
      value: lowRisk.length,
      fill: "#10b981",
    },
  ];

  const chartData = [...anomalies]
    .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
    .map((item) => ({
      invoice: item.invoice_id,
      amount: Number(item.amount || 0),
      risk: item.risk_level,
    }));

  return (
    <div className="min-h-screen bg-[#080d18] text-slate-200">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-[235px] shrink-0 border-r border-slate-800 bg-[#0b1220] lg:flex lg:flex-col">
          <div className="border-b border-slate-800 px-5 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15">
                <Shield size={22} className="text-indigo-400" />
              </div>

              <div>
                <h2 className="font-bold text-white">
                  FinSight AI
                </h2>

                <p className="text-xs text-slate-500">
                  Financial Intelligence
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-5">
            <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Workspace
            </p>

            <Link
              to="/"
              className="mb-1 flex items-center gap-3 rounded-xl bg-indigo-500/15 px-3 py-3 text-sm font-medium text-indigo-300"
            >
              <LayoutDashboard size={17} />
              Overview
            </Link>

            <Link
              to="/investigations"
              className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
            >
              <ShieldAlert size={17} />
              Investigations
            </Link>

            <Link
              to="/transactions"
              className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
            >
              <BarChart3 size={17} />
              Transactions
            </Link>

            <Link
              to="/cash-flow"
              className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
            >
              <TrendingUp size={17} />
              Cash Flow
            </Link>

            <Link
              to="/ai-assistant"
              className="mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
            >
              <Brain size={17} />
              AI Assistant
            </Link>
          </nav>

          <div className="border-t border-slate-800 p-3">
            <Link
              to="/settings"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 transition hover:bg-slate-800/60 hover:text-white"
            >
              Settings
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Header */}
          <header className="border-b border-slate-800 bg-[#0a101d]/90 px-5 py-5 backdrop-blur sm:px-8">
            <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-cyan-400">
                  <Sparkles size={14} />
                  Financial Intelligence Platform
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  FinSight Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor anomalies and investigate financial risk.
                </p>
              </div>

              <button
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-500/30 hover:text-white disabled:opacity-50"
              >
                {refreshing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}

                <span className="hidden sm:inline">
                  {refreshing ? "Refreshing..." : "Refresh data"}
                </span>
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-[1400px] px-5 py-6 sm:px-8">
            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <AlertTriangle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-400"
                />

                <div>
                  <p className="font-medium text-red-300">
                    Backend connection problem
                  </p>

                  <p className="mt-1 text-sm text-red-400/80">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-cyan-500/15 bg-[#0d1424] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Flagged Transactions
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                    <FileSearch size={18} className="text-cyan-400" />
                  </div>
                </div>

                <p className="text-3xl font-bold text-white">
                  {loading ? "—" : anomalies.length}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Live anomaly results
                </p>
              </div>

              <div className="rounded-2xl border border-red-500/15 bg-[#0d1424] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    High Risk
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                    <ShieldAlert size={18} className="text-red-400" />
                  </div>
                </div>

                <p className="text-3xl font-bold text-red-400">
                  {loading ? "—" : highRisk.length}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Priority investigation
                </p>
              </div>

              <div className="rounded-2xl border border-amber-500/15 bg-[#0d1424] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Medium Risk
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                    <AlertTriangle size={18} className="text-amber-400" />
                  </div>
                </div>

                <p className="text-3xl font-bold text-amber-400">
                  {loading ? "—" : mediumRisk.length}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Analyst review
                </p>
              </div>

              <div className="rounded-2xl border border-violet-500/15 bg-[#0d1424] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Flagged Value
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                    <WalletCards size={18} className="text-violet-400" />
                  </div>
                </div>

                <p className="text-2xl font-bold text-white">
                  {loading ? "—" : formatCurrency(flaggedValue)}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Combined anomaly amount
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="mt-6 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
              <section className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp
                        size={18}
                        className="text-cyan-400"
                      />

                      <h2 className="font-semibold text-white">
                        Flagged Transaction Value
                      </h2>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Amount by live anomaly case
                    </p>
                  </div>

                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold text-cyan-400">
                    LIVE
                  </span>
                </div>

                <div className="h-[310px]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2
                        className="animate-spin text-slate-600"
                        size={25}
                      />
                    </div>
                  ) : chartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-600">
                      No anomaly data available.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 10,
                          right: 10,
                          left: 5,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1e293b"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="invoice"
                          tick={{
                            fill: "#64748b",
                            fontSize: 11,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          tick={{
                            fill: "#64748b",
                            fontSize: 10,
                          }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) =>
                            `₹${Math.round(value / 1000)}K`
                          }
                        />

                        <Tooltip
                          cursor={{ fill: "#111827" }}
                          contentStyle={{
                            background: "#0b1220",
                            border: "1px solid #1e293b",
                            borderRadius: "12px",
                            color: "#fff",
                          }}
                          formatter={(value) => [
                            formatCurrency(value),
                            "Amount",
                          ]}
                        />

                        <Bar
                          dataKey="amount"
                          radius={[5, 5, 0, 0]}
                        >
                          {chartData.map((entry) => (
                            <Cell
                              key={entry.invoice}
                              fill={
                                entry.risk === "HIGH"
                                  ? "#ef4444"
                                  : entry.risk === "MEDIUM"
                                  ? "#f59e0b"
                                  : "#22c55e"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 sm:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Shield size={18} className="text-cyan-400" />

                  <h2 className="font-semibold text-white">
                    Risk Distribution
                  </h2>
                </div>

                <p className="text-xs text-slate-500">
                  Current anomaly severity
                </p>

                <div className="relative mx-auto mt-2 h-[220px] max-w-[280px]">
                  {!loading && anomalies.length > 0 && (
                    <>
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <PieChart>
                          <Pie
                            data={riskData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={65}
                            outerRadius={92}
                            paddingAngle={2}
                            stroke="#0d1424"
                            strokeWidth={3}
                          >
                            {riskData.map((entry) => (
                              <Cell
                                key={entry.name}
                                fill={entry.fill}
                              />
                            ))}
                          </Pie>

                          <Tooltip
                            contentStyle={{
                              background: "#0b1220",
                              border: "1px solid #1e293b",
                              borderRadius: "12px",
                              color: "#fff",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-2xl font-bold text-white">
                          {anomalies.length}
                        </p>

                        <p className="text-[10px] text-slate-500">
                          Cases
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-red-500/5 p-3 text-center">
                    <p className="text-xl font-bold text-red-400">
                      {loading ? "—" : highRisk.length}
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">
                      High
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-500/5 p-3 text-center">
                    <p className="text-xl font-bold text-amber-400">
                      {loading ? "—" : mediumRisk.length}
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">
                      Medium
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-500/5 p-3 text-center">
                    <p className="text-xl font-bold text-emerald-400">
                      {loading ? "—" : lowRisk.length}
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">
                      Low
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Highest priority */}
            {largestCase && (
              <section className="mt-6 rounded-2xl border border-red-500/15 bg-[#0d1424] p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert
                        size={18}
                        className="text-red-400"
                      />

                      <h2 className="font-semibold text-white">
                        Highest-Value Flagged Case
                      </h2>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Priority case identified by the anomaly engine
                    </p>
                  </div>

                  <Link
                    to="/investigations"
                    className="hidden items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 sm:flex"
                  >
                    Investigate
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                  <div>
                    <p className="text-lg font-bold text-white">
                      {largestCase.invoice_id}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Vendor {largestCase.vendor_id}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-600">
                      Amount
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      {formatCurrency(largestCase.amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-600">
                      Risk
                    </p>

                    <span
                      className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${riskClass(
                        largestCase.risk_level
                      )}`}
                    >
                      {riskIcon(largestCase.risk_level)}
                      {largestCase.risk_level}
                    </span>
                  </div>

                  <Link
                    to="/investigations"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-500/30 hover:text-white"
                  >
                    View case
                    <ChevronRight size={15} />
                  </Link>
                </div>

                {largestCase.reasons?.length > 0 && (
                  <div className="mt-5 border-t border-slate-800 pt-4">
                    <p className="mb-2 text-xs font-medium text-slate-500">
                      Detection signals
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {largestCase.reasons.map((reason, index) => (
                        <span
                          key={`${reason}-${index}`}
                          className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Recent cases */}
            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1424]">
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5 sm:px-6">
                <div>
                  <div className="flex items-center gap-2">
                    <FileSearch
                      size={18}
                      className="text-cyan-400"
                    />

                    <h2 className="font-semibold text-white">
                      Recent Investigations
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Live cases from the anomaly detection engine
                  </p>
                </div>

                <Link
                  to="/investigations"
                  className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                >
                  View all
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div>
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2
                      size={25}
                      className="animate-spin text-slate-600"
                    />
                  </div>
                ) : anomalies.length === 0 ? (
                  <div className="py-16 text-center text-sm text-slate-600">
                    No flagged cases found.
                  </div>
                ) : (
                  anomalies
                    .slice()
                    .sort((a, b) => {
                      const order = {
                        HIGH: 0,
                        MEDIUM: 1,
                        LOW: 2,
                      };

                      return (
                        (order[a.risk_level] ?? 3) -
                        (order[b.risk_level] ?? 3)
                      );
                    })
                    .map((item) => (
                      <div
                        key={item.invoice_id}
                        className="flex flex-col gap-4 border-b border-slate-800 px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:px-6"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            item.risk_level === "HIGH"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {riskIcon(item.risk_level)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-white">
                              {item.invoice_id}
                            </p>

                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${riskClass(
                                item.risk_level
                              )}`}
                            >
                              {item.risk_level}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            Vendor {item.vendor_id}
                          </p>

                          {item.reasons?.[0] && (
                            <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                              {item.reasons[0]}
                            </p>
                          )}
                        </div>

                        <div className="sm:text-right">
                          <p className="font-semibold text-white">
                            {formatCurrency(item.amount)}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-600">
                            Flagged amount
                          </p>
                        </div>

                        <Link
                          to="/investigations"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 text-slate-500 transition hover:border-cyan-500/30 hover:text-cyan-400"
                          title={`Investigate ${item.invoice_id}`}
                        >
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    ))
                )}
              </div>
            </section>

            {/* System explanation */}
            <section className="mt-6 rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.025] p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                  <Brain size={19} className="text-cyan-400" />
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    How FinSight works
                  </h3>

                  <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">
                    FinSight first detects financial anomalies using
                    deterministic backend rules and evidence. The
                    investigation engine then connects the invoice,
                    purchase order, vendor history and approval evidence.
                    Gemini is used afterward to explain the collected
                    evidence and support analyst review.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-lg bg-slate-900 px-3 py-2 text-slate-400">
                      Transaction data
                    </span>

                    <ArrowRight size={13} className="text-slate-700" />

                    <span className="rounded-lg bg-slate-900 px-3 py-2 text-slate-400">
                      Detection
                    </span>

                    <ArrowRight size={13} className="text-slate-700" />

                    <span className="rounded-lg bg-slate-900 px-3 py-2 text-slate-400">
                      Evidence chain
                    </span>

                    <ArrowRight size={13} className="text-slate-700" />

                    <span className="rounded-lg bg-violet-500/10 px-3 py-2 text-violet-300">
                      Gemini reasoning
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
