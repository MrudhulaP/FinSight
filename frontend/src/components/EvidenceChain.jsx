import {
  CheckCircle2,
  CircleAlert,
  FileCheck2,
  GitBranch,
  ShieldCheck,
} from "lucide-react";

function getStepIcon(flagged, index) {
  if (flagged) {
    return <CircleAlert size={18} />;
  }

  if (index === 0) {
    return <FileCheck2 size={18} />;
  }

  return <CheckCircle2 size={18} />;
}

export default function EvidenceChain({ steps = [] }) {
  if (!steps || steps.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-accent" size={20} />
          <div>
            <h3 className="font-semibold text-ink">Evidence Chain</h3>
            <p className="mt-1 text-sm text-ink-muted">
              No evidence steps are available for this investigation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch size={18} className="text-accent" />
            <h3 className="font-semibold text-ink">Evidence Chain</h3>
          </div>

          <p className="mt-1 text-sm text-ink-muted">
            Deterministic evidence collected during the investigation.
          </p>
        </div>

        <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-muted">
          {steps.length} checks
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const flagged = Boolean(step?.flagged);

          return (
            <div
              key={`${step?.key || step?.label || "step"}-${index}`}
              className={[
                "group relative flex gap-4 rounded-xl border p-4 transition-all duration-200",
                flagged
                  ? "border-risk-high/20 bg-risk-high/5"
                  : "border-border bg-surface-2/50 hover:border-accent/20",
              ].join(" ")}
            >
              {index < steps.length - 1 && (
                <div className="absolute left-[27px] top-[48px] h-[calc(100%+12px)] w-px bg-border" />
              )}

              <div
                className={[
                  "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                  flagged
                    ? "border-risk-high/20 bg-risk-high/10 text-risk-high"
                    : "border-risk-low/20 bg-risk-low/10 text-risk-low",
                ].join(" ")}
              >
                {getStepIcon(flagged, index)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-ink">
                    {step?.label || step?.key || `Evidence ${index + 1}`}
                  </h4>

                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      flagged
                        ? "bg-risk-high/10 text-risk-high"
                        : "bg-risk-low/10 text-risk-low",
                    ].join(" ")}
                  >
                    {flagged ? "Flagged" : "Clear"}
                  </span>
                </div>

                <p className="mt-1.5 text-sm leading-6 text-ink-muted">
                  {step?.message ||
                    step?.description ||
                    "Evidence check completed."}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}