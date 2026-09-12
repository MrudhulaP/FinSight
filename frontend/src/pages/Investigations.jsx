import {
  AlertTriangle,
  Brain,
  Clock3,
  FileSearch,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { useInvestigation } from "../hooks/useInvestigation";
import RiskBadge, { riskMeta } from "../components/RiskBadge";
import EvidenceChain from "../components/EvidenceChain";
import PipelineTrail from "../components/PipelineTrail";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function Investigations() {
  const {
    anomalies,
    selectedId,
    setSelectedId,
    selectedAnomaly,
    investigation,
    trail,
    steps,
    loadingAnomalies,
    loadingInvestigation,
    error,
    reload,
  } = useInvestigation();

  const riskLevel = selectedAnomaly?.risk_level || "MEDIUM";
  const meta = riskMeta(riskLevel);
  const flaggedEvidence = steps.filter((step) => step.flagged).length;

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-signal">
            <ShieldAlert size={16} />
            Financial Investigation Engine
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Investigation Workspace
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
            Follow the evidence from anomaly detection to AI-assisted
            investigation.
          </p>
        </div>

        <button
          onClick={reload}
          disabled={loadingAnomalies}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:border-border-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loadingAnomalies ? "animate-spin" : ""}
          />
          Refresh investigations
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-risk-high/20 bg-risk-high-soft p-4">
          <AlertTriangle
            className="mt-0.5 shrink-0 text-risk-high"
            size={19}
          />
          <div>
            <p className="font-medium text-risk-high">Connection issue</p>
            <p className="mt-1 text-sm text-ink-muted">{error}</p>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
        {/* Case list */}
        <aside className="h-fit rounded-2xl border border-border bg-surface p-4 xl:sticky xl:top-22">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-ink">Flagged Cases</h2>
              <p className="mt-1 text-xs text-ink-faint">
                Live backend results
              </p>
            </div>
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-muted">
              {anomalies.length}
            </span>
          </div>

          {loadingAnomalies ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-surface-2"
                />
              ))}
            </div>
          ) : anomalies.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface-2 p-5 text-center">
              <ShieldCheck
                size={28}
                className="mx-auto mb-3 text-risk-low"
              />
              <p className="text-sm font-medium text-ink">
                No anomalies found
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                The backend did not flag any invoices.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {anomalies.map((item) => {
                const itemMeta = riskMeta(item.risk_level);
                const active = item.invoice_id === selectedId;

                return (
                  <button
                    key={item.invoice_id}
                    onClick={() => setSelectedId(item.invoice_id)}
                    aria-current={active}
                    className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition-colors duration-150 ${
                      active
                        ? "border-accent/30 bg-accent-soft"
                        : "border-border bg-surface hover:border-border-strong hover:bg-surface-hover"
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-0 h-full w-[3px] ${itemMeta.solid}`}
                    />

                    <div className="mb-2 flex items-center justify-between gap-3 pl-1.5">
                      <span className="font-data font-semibold text-ink">
                        {item.invoice_id}
                      </span>
                      <RiskBadge level={item.risk_level} size="sm" />
                    </div>

                    <p className="truncate pl-1.5 text-sm text-ink-muted">
                      {item.vendor_id}
                    </p>

                    <p className="mt-2 pl-1.5 font-data text-sm font-medium text-ink">
                      {formatCurrency(item.amount)}
                    </p>

                    <p className="mt-2 line-clamp-2 pl-1.5 text-xs leading-5 text-ink-faint">
                      {item.reasons?.[0] || "Anomaly detected"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Investigation detail */}
        <main className="min-w-0">
          {loadingInvestigation ? (
            <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-border bg-surface">
              <div className="text-center">
                <Loader2
                  size={34}
                  className="mx-auto mb-4 animate-spin text-signal"
                />
                <p className="font-medium text-ink">
                  Building investigation...
                </p>
                <p className="mt-2 text-sm text-ink-faint">
                  Collecting evidence and asking Gemini to explain it.
                </p>
              </div>
            </div>
          ) : !trail ? (
            <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-border bg-surface">
              <div className="text-center">
                <FileSearch
                  size={36}
                  className="mx-auto mb-4 text-ink-faint"
                />
                <p className="font-medium text-ink-muted">
                  Select an investigation
                </p>
                <p className="mt-2 text-sm text-ink-faint">
                  Choose a flagged invoice from the left.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pipeline trail */}
              <div className="fs-enter rounded-2xl border border-border bg-surface p-4">
                <PipelineTrail activeIndex={4} />
              </div>

              {/* Case summary */}
              <section className="fs-enter overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="border-b border-border p-6">
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-signal/25 bg-signal-soft px-2.5 py-1 font-data text-xs font-semibold text-signal">
                          {trail.invoice_id}
                        </span>
                        <RiskBadge level={riskLevel} suffix="RISK" />
                      </div>

                      <h2 className="text-2xl font-bold text-ink">
                        {trail.vendor_name}
                      </h2>
                      <p className="mt-1 text-sm text-ink-faint">
                        Vendor ID: {trail.vendor_id}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-surface-2 px-5 py-4 text-left lg:text-right">
                      <p className="text-xs uppercase tracking-wider text-ink-faint">
                        Invoice Amount
                      </p>
                      <p className="mt-1 font-data text-2xl font-bold text-ink">
                        {formatCurrency(trail.invoice_amount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-ink-faint">
                      Purchase Order
                    </p>
                    <p className="mt-2 font-data font-semibold text-ink">
                      {trail.po_id || "No PO"}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {trail.po_amount != null
                        ? formatCurrency(trail.po_amount)
                        : "Unavailable"}
                    </p>
                  </div>

                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-ink-faint">
                      Vendor Average
                    </p>
                    <p className="mt-2 font-data font-semibold text-ink">
                      {formatCurrency(trail.vendor_avg)}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      Historical invoice average
                    </p>
                  </div>

                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-ink-faint">
                      Approval
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Clock3 size={16} className="text-risk-medium" />
                      <span className="font-data font-semibold text-ink">
                        {trail.approval_minutes} min
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">
                      Approver: {trail.approver_id}
                    </p>
                  </div>

                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-ink-faint">
                      Evidence Signals
                    </p>
                    <p className="mt-2 font-data font-semibold text-ink">
                      {flaggedEvidence} flagged
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {steps.length} checks performed
                    </p>
                  </div>
                </div>
              </section>

              {/* Risk signals */}
              {selectedAnomaly?.reasons?.length > 0 && (
                <section className="fs-enter rounded-2xl border border-border bg-surface p-6">
                  <div className="mb-5">
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={19} className={meta.text} />
                      <h3 className="font-semibold text-ink">
                        Risk Signals
                      </h3>
                      <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                        Deterministic
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-faint">
                      Signals identified by the FinSight detection engine —
                      calculated, not inferred.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedAnomaly.reasons.map((reason, index) => (
                      <div
                        key={`${reason}-${index}`}
                        className={`rounded-xl border p-4 ${meta.badge}`}
                      >
                        <div className="flex gap-3">
                          <AlertTriangle
                            size={17}
                            className="mt-0.5 shrink-0"
                          />
                          <p className="text-sm leading-6">{reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Evidence chain */}
              <section className="fs-enter rounded-2xl border border-border bg-surface p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <FileSearch size={19} className="text-signal" />
                    <h3 className="font-semibold text-ink">
                      Evidence Chain
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-ink-faint">
                    Every conclusion is grounded in evidence collected by the
                    backend investigation engine.
                  </p>
                </div>

                <EvidenceChain steps={steps} />
              </section>

              {/* Gemini investigation */}
              <section className="fs-enter overflow-hidden rounded-2xl border border-accent/20 bg-surface">
                <div className="border-b border-accent/10 bg-accent-soft p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-accent">
                          <Brain size={19} />
                        </div>
                        <h3 className="font-semibold text-ink">
                          AI Investigation
                        </h3>
                        <span className="rounded-full border border-accent/30 bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                          AI-generated
                        </span>
                      </div>
                      <p className="text-sm text-ink-muted">
                        Evidence-grounded reasoning powered by Gemini.
                      </p>
                    </div>

                    <span className="w-fit rounded-full border border-accent/30 bg-surface px-3 py-1.5 text-xs font-bold tracking-wide text-accent">
                      GEMINI AI
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="rounded-xl border border-border bg-surface-2 p-5">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-ink-muted">
                      {investigation.explanation ||
                        "Gemini did not return an explanation for this case."}
                    </p>
                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-risk-medium/20 bg-risk-medium-soft p-4">
                    <ShieldAlert
                      size={18}
                      className="mt-0.5 shrink-0 text-risk-medium"
                    />
                    <div>
                      <p className="text-sm font-semibold text-risk-medium">
                        Recommended analyst action
                      </p>
                      <p className="mt-1 text-sm leading-6 text-ink-muted">
                        Review the evidence trail, verify the purchase order
                        and vendor justification, and confirm the approval
                        before releasing payment.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer status */}
              <div className="fs-enter flex flex-col justify-between gap-3 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${meta.solid}`} />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      Investigation requires analyst review
                    </p>
                    <p className="text-xs text-ink-faint">
                      FinSight provides evidence and AI reasoning, not an
                      automatic financial decision.
                    </p>
                  </div>
                </div>

                <span className="text-xs text-ink-faint">
                  Live backend investigation
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}