import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  FileWarning,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

import { useAnomalies } from "../hooks/useAnomalies";
import RiskBadge from "../components/RiskBadge";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatCompactCurrency(value) {
  const amount = Number(value || 0);

  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;

  return formatCurrency(amount);
}

function rowAccent(risk) {
  if (risk === "HIGH") return "bg-risk-high";
  if (risk === "MEDIUM") return "bg-risk-medium";
  return "bg-risk-low";
}

function iconTone(risk) {
  if (risk === "HIGH") return "bg-risk-high-soft text-risk-high";
  if (risk === "MEDIUM") return "bg-risk-medium-soft text-risk-medium";
  return "bg-risk-low-soft text-risk-low";
}

function SignalList({ reasons }) {
  if (!reasons || reasons.length === 0) {
    return <span className="text-sm text-ink-faint">No detection signals</span>;
  }

  return (
    <ul className="space-y-1.5">
      {reasons.map((reason, index) => (
        <li
          key={`${reason}-${index}`}
          className="flex items-start gap-2 text-sm leading-5 text-ink-muted"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-faint" />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Transactions() {
  const { anomalies, loading, error, stats, reload } = useAnomalies();

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [sortDescending, setSortDescending] = useState(true);

  const filteredAnomalies = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = anomalies.filter((item) => {
      const matchesRisk = riskFilter === "ALL" || item.risk_level === riskFilter;

      const searchableText = [
        item.invoice_id,
        item.vendor_id,
        item.risk_level,
        ...(item.reasons || []),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      return matchesRisk && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      const amountA = Number(a.amount || 0);
      const amountB = Number(b.amount || 0);
      return sortDescending ? amountB - amountA : amountA - amountB;
    });
  }, [anomalies, search, riskFilter, sortDescending]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-signal">
          <Activity size={15} />
          Financial Monitoring
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Transactions
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">
              Monitor transactions flagged by FinSight&apos;s deterministic
              anomaly-detection engine.
            </p>
          </div>

          <button
            onClick={reload}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink-muted transition-colors duration-150 hover:border-border-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh data"}
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-risk-high/25 bg-risk-high-soft px-5 py-4">
          <AlertTriangle size={19} className="mt-0.5 shrink-0 text-risk-high" />
          <div>
            <p className="text-sm font-semibold text-risk-high">
              Backend connection failed
            </p>
            <p className="mt-1 text-sm text-ink-muted">{error}</p>
            <button
              onClick={reload}
              className="mt-3 text-xs font-semibold text-risk-high underline underline-offset-4 hover:text-ink"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-signal/20 bg-surface p-5 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                Flagged transactions
              </p>
              <p className="mt-3 font-data text-2xl font-bold text-ink">
                {loading ? "—" : stats.total}
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                Live anomaly results
              </p>
            </div>
            <div className="rounded-xl border border-signal/20 bg-signal-soft p-2.5 text-signal">
              <FileWarning size={19} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-risk-high/20 bg-surface p-5 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                High risk
              </p>
              <p className="mt-3 font-data text-2xl font-bold text-risk-high">
                {loading ? "—" : stats.highCount}
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                Requires priority review
              </p>
            </div>
            <div className="rounded-xl border border-risk-high/20 bg-risk-high-soft p-2.5 text-risk-high">
              <ShieldAlert size={19} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-risk-medium/20 bg-surface p-5 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                Medium risk
              </p>
              <p className="mt-3 font-data text-2xl font-bold text-risk-medium">
                {loading ? "—" : stats.mediumCount}
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                Requires analyst review
              </p>
            </div>
            <div className="rounded-xl border border-risk-medium/20 bg-risk-medium-soft p-2.5 text-risk-medium">
              <AlertTriangle size={19} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-signal/20 bg-surface p-5 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                Flagged value
              </p>
              <p className="mt-3 font-data text-2xl font-bold text-ink">
                {loading ? "—" : formatCompactCurrency(stats.flaggedValue)}
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                Combined anomaly amount
              </p>
            </div>
            <div className="rounded-xl border border-signal/20 bg-signal-soft p-2.5 text-signal">
              <TrendingUp size={19} />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-5 rounded-2xl border border-border bg-surface p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice, vendor, or risk reason..."
              className="h-11 w-full rounded-xl border border-border bg-canvas pl-11 pr-4 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-ink-faint focus:border-accent/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((filter) => {
              const active = riskFilter === filter;

              return (
                <button
                  key={filter}
                  onClick={() => setRiskFilter(filter)}
                  className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors duration-150 ${
                    active
                      ? "border-accent/40 bg-accent-soft text-accent"
                      : "border-border bg-canvas text-ink-faint hover:border-border-strong hover:text-ink-muted"
                  }`}
                >
                  {filter === "ALL" ? "All" : `${filter} Risk`}
                </button>
              );
            })}

            <button
              onClick={() => setSortDescending((current) => !current)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-canvas px-4 py-2.5 text-xs font-semibold text-ink-muted transition-colors duration-150 hover:border-border-strong hover:text-ink"
            >
              {sortDescending ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
              Amount
            </button>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-ink">
              Flagged Transactions
            </h2>
            <p className="mt-1 text-xs text-ink-faint">
              {loading
                ? "Loading live backend results..."
                : `Showing ${filteredAnomalies.length} of ${anomalies.length} backend results`}
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-signal/25 bg-signal-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-signal">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" />
            Live
          </span>
        </div>

        {loading ? (
          <div className="space-y-2 p-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-surface-2"
              />
            ))}
          </div>
        ) : filteredAnomalies.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="rounded-2xl border border-border bg-surface-2 p-4 text-ink-faint">
              <Search size={24} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-ink-muted">
              No transactions found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-ink-faint">
              Try changing the search text or risk filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border bg-surface-2 text-left">
                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    Invoice
                  </th>
                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    Vendor
                  </th>
                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    Amount
                  </th>
                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    Risk
                  </th>
                  <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    Detection signals
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAnomalies.map((item) => (
                  <tr
                    key={item.invoice_id}
                    className="border-b border-border/70 transition-colors duration-150 last:border-b-0 hover:bg-surface-hover"
                  >
                    <td className="px-5 py-5 align-top">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 rounded-lg p-2 ${iconTone(
                            item.risk_level
                          )}`}
                        >
                          <FileWarning size={15} />
                        </div>
                        <div>
                          <p className="font-data text-sm font-bold text-ink">
                            {item.invoice_id}
                          </p>
                          <p className="mt-1 text-[11px] text-ink-faint">
                            Invoice
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5 align-top">
                      <p className="text-sm font-semibold text-ink-muted">
                        {item.vendor_id}
                      </p>
                      <p className="mt-1 text-[11px] text-ink-faint">
                        Vendor ID
                      </p>
                    </td>

                    <td className="px-5 py-5 align-top">
                      <p className="font-data text-sm font-bold text-ink">
                        {formatCurrency(item.amount)}
                      </p>
                    </td>

                    <td className="px-5 py-5 align-top">
                      <RiskBadge level={item.risk_level} />
                    </td>

                    <td className="max-w-[650px] px-5 py-5 align-top">
                      <SignalList reasons={item.reasons} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Explanation */}
      <section className="mt-5 rounded-2xl border border-signal/15 bg-signal-soft px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-signal/25 bg-surface p-2.5 text-signal">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">
              How FinSight works
            </h3>
            <p className="mt-1 max-w-4xl text-xs leading-5 text-ink-muted">
              Numerical anomaly detection is performed deterministically by
              the FastAPI backend using transaction, vendor, purchase-order
              and approval evidence. Gemini is used later to explain an
              investigation rather than inventing or calculating financial
              facts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}