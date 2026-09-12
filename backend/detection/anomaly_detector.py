"""
FinSight - Anomaly Detector
Runs every rule from rules.py against each invoice and produces a risk level
(HIGH / MEDIUM / LOW / none) based on how many rules triggered.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

import pandas as pd
from data.loader import load_all
from detection.rules import (
    check_po_mismatch,
    check_missing_po,
    check_vendor_deviation,
    check_fast_approval,
    check_duplicate_invoice,
)


def _risk_level(num_triggers: int) -> str:
    if num_triggers >= 3:
        return "HIGH"
    elif num_triggers == 2:
        return "MEDIUM"
    elif num_triggers == 1:
        return "LOW"
    return "NONE"


def detect_anomalies() -> list[dict]:
    """
    Returns a list of dicts, one per invoice that triggered at least one rule:
    {
        "invoice_id": str,
        "risk_level": "HIGH" | "MEDIUM" | "LOW",
        "reasons": [str, ...]
    }
    """
    data = load_all()
    invoices = data["invoices"]
    purchase_orders = data["purchase_orders"]
    vendors = data["vendors"]
    approvals = data["approvals"]

    results = []

    for _, inv in invoices.iterrows():
        reasons = []

        # --- PO checks ---
        po_id = inv["po_id"]
        po_triggered, po_detail = check_missing_po(po_id)
        if po_triggered:
            reasons.append(po_detail)
        else:
            po_row = purchase_orders[purchase_orders["po_id"] == po_id]
            if not po_row.empty:
                po_amount = float(po_row.iloc[0]["amount"])
                mismatch_triggered, mismatch_detail = check_po_mismatch(inv["amount"], po_amount)
                if mismatch_triggered:
                    reasons.append(mismatch_detail)

        # --- Vendor deviation ---
        vendor_row = vendors[vendors["vendor_id"] == inv["vendor_id"]]
        if not vendor_row.empty:
            vendor_avg = float(vendor_row.iloc[0]["avg_invoice_amount"])
            dev_triggered, dev_detail = check_vendor_deviation(inv["amount"], vendor_avg)
            if dev_triggered:
                reasons.append(dev_detail)

        # --- Approval speed ---
        approval_row = approvals[approvals["invoice_id"] == inv["invoice_id"]]
        if not approval_row.empty:
            approval_minutes = (
                approval_row.iloc[0]["approved_at"] - approval_row.iloc[0]["submitted_at"]
            ).total_seconds() / 60
            fast_triggered, fast_detail = check_fast_approval(approval_minutes)
            if fast_triggered:
                reasons.append(fast_detail)

        # --- Duplicate invoice ---
        dup_triggered, dup_detail = check_duplicate_invoice(inv, invoices)
        if dup_triggered:
            reasons.append(dup_detail)

        if reasons:
            results.append({
                "invoice_id": inv["invoice_id"],
                "vendor_id": inv["vendor_id"],
                "amount": float(inv["amount"]),
                "risk_level": _risk_level(len(reasons)),
                "reasons": reasons,
            })

    # Sort HIGH -> MEDIUM -> LOW for a nicer dashboard feed
    order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    results.sort(key=lambda r: order.get(r["risk_level"], 3))

    return results


if __name__ == "__main__":
    flagged = detect_anomalies()
    print(f"Flagged {len(flagged)} invoice(s):\n")
    for f in flagged:
        print(f"{f['invoice_id']}  [{f['risk_level']}]")
        for r in f["reasons"]:
            print(f"   - {r}")
        print()