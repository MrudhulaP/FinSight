import {
  ArrowRight,
  BrainCircuit,
  CircleAlert,
  Database,
  FileSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const defaultStages = [
  {
    key: "detection",
    label: "Anomaly Detection",
    description: "Financial rules identify unusual transaction behaviour.",
    icon: CircleAlert,
  },
  {
    key: "evidence",
    label: "Evidence Collection",
    description: "Relevant invoice, PO, vendor and approval evidence is connected.",
    icon: FileSearch,
  },
  {
    key: "investigation",
    label: "Investigation Engine",
    description: "The evidence is assembled into a traceable investigation trail.",
    icon: Database,
  },
  {
    key: "reasoning",
    label: "Gemini Reasoning",
    description: "Gemini explains the evidence without inventing financial facts.",
    icon: BrainCircuit,
  },
  {
    key: "action",
    label: "Recommended Action",
    description: "The investigation produces an analyst-oriented next step.",
    icon: ShieldCheck,
  },
];

export default function PipelineTrail({ stages = defaultStages }) {
  const visibleStages =
    Array.isArray(stages) && stages.length > 0
      ? stages
      : defaultStages;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-accent" />
            <h3 className="font-semibold text-ink">
              Investigation Pipeline
            </h3>
          </div>

          <p className="mt-1 text-sm text-ink-muted">
            Follow the case from anomaly detection to explainable
            investigation.
          </p>
        </div>

        <span className="rounded-full border border-accent/20 bg-accent/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
          Evidence-first
        </span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-stretch gap-3">
          {visibleStages.map((stage, index) => {
            const Icon = stage?.icon || defaultStages[index]?.icon || Database;

            return (
              <div key={`${stage?.key || stage?.label || "stage"}-${index}`}>
                <div className="flex items-center gap-3">
                  <div className="w-[220px] rounded-xl border border-border bg-surface-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-soft">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent/5 text-accent">
                        <Icon size={18} />
                      </div>

                      <span className="font-mono text-[10px] text-ink-faint">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-ink">
                      {stage?.label || `Stage ${index + 1}`}
                    </h4>

                    <p className="mt-1.5 text-xs leading-5 text-ink-muted">
                      {stage?.description ||
                        stage?.message ||
                        "Investigation stage completed."}
                    </p>
                  </div>

                  {index < visibleStages.length - 1 && (
                    <ArrowRight
                      size={18}
                      className="shrink-0 text-ink-faint"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}