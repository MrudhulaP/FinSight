import { useState } from "react";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  FileWarning,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { useAnomalies } from "../hooks/useAnomalies";
import RiskBadge from "../components/RiskBadge";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function formatINR(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function parseAIText(text) {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function AIAssistant() {
  const {
    anomalies,
    loading: loadingCases,
    error: listError,
    reload,
  } = useAnomalies();

  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [trail, setTrail] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");

  const selectedCase =
    anomalies.find((item) => item.invoice_id === selectedInvoice) || null;

  // Auto-select the first case once the list arrives, mirroring the
  // original behavior without refetching on every anomalies change.
  if (!selectedInvoice && anomalies.length > 0) {
    setSelectedInvoice(anomalies[0].invoice_id);
  }

  async function investigate(customQuestion = "") {
    if (!selectedInvoice) return;

    try {
      setLoadingAI(true);
      setAiError("");

      const response = await fetch(`${API_BASE}/trail/${selectedInvoice}`);

      if (!response.ok) {
        throw new Error("Investigation request failed.");
      }

      const data = await response.json();
      setTrail(data.trail || null);

      let explanation = data.explanation || "";

      if (customQuestion.trim()) {
        explanation = `${explanation}\n\nAnalyst question: ${customQuestion.trim()}`;
      }

      setAnswer(explanation);
    } catch (err) {
      setAiError(
        "Unable to load the investigation. Please check that the backend is running."
      );
    } finally {
      setLoadingAI(false);
    }
  }

  function handleAsk() {
    const trimmed = question.trim();
    if (!trimmed) {
      investigate();
      return;
    }
    investigate(trimmed);
  }

  function handleExample(questionText) {
    setQuestion(questionText);
    investigate(questionText);
  }

  function handleSelectCase(invoiceId) {
    setSelectedInvoice(invoiceId);
    setAnswer("");
    setTrail(null);
    setQuestion("");
    setAiError("");
  }

  const error = listError || aiError;

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-signal">
            <Sparkles size={16} />
            Financial Intelligence Assistant
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-ink lg:text-4xl">
            AI Assistant
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-ink-muted">
            Ask questions about flagged financial activity and receive
            evidence-grounded explanations from the FinSight investigation
            engine.
          </p>
        </div>

        <button
          onClick={reload}
          disabled={loadingCases}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:border-border-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loadingCases ? "animate-spin" : ""} />
          Refresh cases
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[350px_minmax(0,1fr)]">
        {/* Left panel */}
        <section className="h-fit rounded-2xl border border-border bg-surface xl:sticky xl:top-22">
          <div className="border-b border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-ink">Flagged Cases</h2>
                <p className="mt-1 text-xs text-ink-faint">
                  Select a case to investigate
                </p>
              </div>
              <div className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-muted">
                {anomalies.length}
              </div>
            </div>
          </div>

          <div className="max-h-[620px] space-y-3 overflow-y-auto p-4">
            {loadingCases ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-xl bg-surface-2"
                  />
                ))}
              </div>
            ) : anomalies.length === 0 ? (
              <div className="py-12 text-center text-sm text-ink-faint">
                No flagged cases found.
              </div>
            ) : (
              anomalies.map((item) => {
                const active = item.invoice_id === selectedInvoice;

                return (
                  <button
                    key={item.invoice_id}
                    onClick={() => handleSelectCase(item.invoice_id)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors duration-150 ${
                      active
                        ? "border-accent/40 bg-accent-soft"
                        : "border-border bg-canvas hover:border-border-strong hover:bg-surface-hover"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-data font-semibold text-ink">
                        {item.invoice_id}
                      </span>
                      <RiskBadge level={item.risk_level} size="sm" />
                    </div>

                    <div className="mb-2 font-data text-lg font-bold text-ink">
                      {formatINR(item.amount)}
                    </div>

                    <div className="text-xs leading-5 text-ink-faint">
                      {item.reasons?.[0] || "Anomaly detected"}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Right panel */}
        <section className="space-y-6">
          {selectedCase && (
            <div className="rounded-2xl border border-border bg-surface">
              <div className="flex flex-col gap-5 border-b border-border p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-signal-soft text-signal">
                    <FileWarning size={23} />
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-ink">
                        {selectedCase.invoice_id}
                      </h2>
                      <RiskBadge level={selectedCase.risk_level} suffix="RISK" />
                    </div>
                    <p className="mt-1 text-sm text-ink-faint">
                      Vendor {selectedCase.vendor_id}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-canvas px-5 py-3">
                  <div className="text-[10px] uppercase tracking-wider text-ink-faint">
                    Invoice Amount
                  </div>
                  <div className="mt-1 font-data text-xl font-bold text-ink">
                    {formatINR(selectedCase.amount)}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <label className="mb-2 block text-sm font-medium text-ink-muted">
                  Ask about this case
                </label>

                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="relative flex-1">
                    <Search
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
                    />
                    <input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAsk();
                      }}
                      placeholder="Why is this invoice high risk?"
                      className="w-full rounded-xl border border-border bg-canvas py-3 pl-11 pr-4 text-sm text-ink outline-none transition-colors duration-150 placeholder:text-ink-faint focus:border-accent/50"
                    />
                  </div>

                  <button
                    onClick={handleAsk}
                    disabled={loadingAI || !selectedInvoice}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingAI ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <BrainCircuit size={17} />
                    )}
                    Investigate
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleExample("Why is this invoice high risk?")}
                    className="rounded-lg border border-border bg-canvas px-3 py-2 text-xs text-ink-muted transition-colors duration-150 hover:border-border-strong hover:text-ink"
                  >
                    Why is this high risk?
                  </button>
                  <button
                    onClick={() => handleExample("What evidence supports this case?")}
                    className="rounded-lg border border-border bg-canvas px-3 py-2 text-xs text-ink-muted transition-colors duration-150 hover:border-border-strong hover:text-ink"
                  >
                    Show supporting evidence
                  </button>
                  <button
                    onClick={() => handleExample("What should an analyst review?")}
                    className="rounded-lg border border-border bg-canvas px-3 py-2 text-xs text-ink-muted transition-colors duration-150 hover:border-border-strong hover:text-ink"
                  >
                    What should I review?
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI response */}
          <div className="rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Bot size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-ink">FinSight AI</h2>
                  <p className="text-xs text-ink-faint">
                    Evidence-grounded financial reasoning
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-[10px] font-bold text-accent">
                GEMINI AI
              </span>
            </div>

            <div className="min-h-[300px] p-6">
              {loadingAI ? (
                <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                    <Loader2 size={26} className="animate-spin" />
                  </div>
                  <h3 className="font-semibold text-ink">
                    Investigating evidence...
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-ink-faint">
                    FinSight is collecting the selected invoice's evidence
                    trail and generating an explanation.
                  </p>
                </div>
              ) : answer ? (
                <div className="rounded-xl border border-border bg-canvas p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <Sparkles size={16} className="text-accent" />
                    <span className="text-sm font-semibold text-ink">
                      AI Investigation
                    </span>
                    {selectedCase && (
                      <RiskBadge level={selectedCase.risk_level} size="sm" />
                    )}
                  </div>

                  <div className="space-y-3 text-sm leading-7 text-ink-muted">
                    {parseAIText(answer).map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>

                  {trail && (
                    <div className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-ink-faint">
                          Invoice
                        </div>
                        <div className="mt-1 font-data text-sm font-semibold text-ink">
                          {trail.invoice_id}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-ink-faint">
                          Vendor
                        </div>
                        <div className="mt-1 text-sm font-semibold text-ink">
                          {trail.vendor_name}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-ink-faint">
                          Evidence Checks
                        </div>
                        <div className="mt-1 text-sm font-semibold text-risk-low">
                          {trail.steps?.length || 0} loaded
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                    <BrainCircuit size={30} />
                  </div>
                  <h3 className="text-lg font-semibold text-ink">
                    Ready to investigate
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-ink-faint">
                    Select a flagged transaction and ask a question. FinSight
                    will retrieve the backend evidence trail and use Gemini
                    to explain what the evidence means.
                  </p>
                  <button
                    onClick={() => investigate()}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:border-accent/40 hover:text-accent"
                  >
                    Investigate {selectedInvoice || "case"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Evidence trail */}
          {trail?.steps?.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface">
              <div className="border-b border-border p-5">
                <div className="flex items-center gap-3">
                  <ShieldAlert size={19} className="text-signal" />
                  <div>
                    <h2 className="font-semibold text-ink">Evidence Trail</h2>
                    <p className="mt-1 text-xs text-ink-faint">
                      Deterministic evidence collected before AI reasoning.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-5">
                {trail.steps.map((step, index) => (
                  <div
                    key={`${step.check}-${index}`}
                    className={`rounded-xl border p-4 ${
                      step.flagged
                        ? "border-risk-high/25 bg-risk-high-soft/40"
                        : "border-border bg-canvas"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold capitalize text-ink">
                          {step.check?.replaceAll("_", " ")}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-ink-muted">
                          {step.result}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${
                          step.flagged
                            ? "border-risk-high/30 bg-risk-high-soft text-risk-high"
                            : "border-risk-low/30 bg-risk-low-soft text-risk-low"
                        }`}
                      >
                        {step.flagged ? "FLAGGED" : "CLEAR"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-risk-high/30 bg-risk-high-soft p-4 text-sm text-risk-high">
              {error}
            </div>
          )}

          {/* Trust note */}
          <div className="rounded-2xl border border-signal/15 bg-signal-soft p-5">
            <div className="flex gap-3">
              <ShieldAlert size={18} className="mt-0.5 shrink-0 text-signal" />
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Evidence-grounded AI
                </h3>
                <p className="mt-1 text-xs leading-5 text-ink-muted">
                  FinSight performs numerical anomaly detection and evidence
                  collection in the backend first. Gemini is used to explain
                  the collected evidence rather than invent financial facts.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}