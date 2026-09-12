"""
FinSight - AI Investigation Prompts

Builds evidence-grounded prompts for the AI reasoning layer.

Important:
The AI should explain the evidence provided by the backend.
It must NOT invent financial facts, amounts, vendors, dates, or risk signals.
"""


def build_narration_prompt(trail: dict) -> str:
    """
    Build an evidence-grounded investigation prompt from a structured
    investigation trail.
    """

    invoice_id = trail.get("invoice_id", "Unknown")
    invoice_amount = trail.get("invoice_amount")
    po_id = trail.get("po_id")
    po_amount = trail.get("po_amount")
    vendor_id = trail.get("vendor_id")
    vendor_name = trail.get("vendor_name", "Unknown")
    vendor_avg = trail.get("vendor_avg")
    approver_id = trail.get("approver_id")
    approval_minutes = trail.get("approval_minutes")
    steps = trail.get("steps", [])

    evidence_lines = []

    for step in steps:
        status = "FLAGGED" if step.get("flagged") else "NORMAL"
        check = step.get("check", "unknown")
        result = step.get("result", "")

        evidence_lines.append(
            f"- [{status}] {check}: {result}"
        )

    evidence = "\n".join(evidence_lines)

    return f"""
You are FinSight AI, a financial investigation assistant.

Your job is to analyze the evidence collected by FinSight's deterministic
financial analysis engine and explain why a transaction may require review.

STRICT RULES:
1. Use ONLY the evidence provided below.
2. Never invent financial facts.
3. Never invent transactions, vendors, purchase orders, approvals, dates,
   amounts, or risk signals.
4. Do not perform your own unsupported numerical assumptions.
5. Clearly distinguish facts from conclusions.
6. If evidence is insufficient, explicitly say so.
7. Keep the explanation concise and suitable for a financial analyst.
8. Recommend a practical next action based only on the evidence.

INVESTIGATION RECORD

Invoice ID:
{invoice_id}

Invoice amount:
{invoice_amount}

Purchase Order ID:
{po_id}

Purchase Order amount:
{po_amount}

Vendor ID:
{vendor_id}

Vendor:
{vendor_name}

Vendor historical average:
{vendor_avg}

Approver:
{approver_id}

Approval time in minutes:
{approval_minutes}

EVIDENCE CHAIN:
{evidence}

RESPOND USING THIS STRUCTURE:

Risk Assessment:
Give a short explanation of the overall concern.

Key Evidence:
List the strongest evidence supporting the concern.

Why It Matters:
Explain why the combination of these signals deserves attention.

Recommended Action:
Give one practical action an analyst should take next.

Keep the response factual, concise, and evidence-based.
""".strip()