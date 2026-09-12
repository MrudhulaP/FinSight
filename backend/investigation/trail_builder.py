"""
FinSight - Investigation Trail Builder
Given a flagged invoice_id, cross-references PO, vendor, and approval records
to build a structured evidence object. This is the differentiator: instead of
a bare risk score, we show WHY.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from data.loader import load_all


def build_trail(invoice_id: str) -> dict:
    """
    Returns a structured evidence object for one invoice:
    {
        "invoice_id": str,
        "invoice_amount": float,
        "po_id": str or None,
        "po_amount": float or None,
        "vendor_id": str,
        "vendor_name": str,
        "vendor_avg": float,
        "approver_id": str or None,
        "approval_minutes": float or None,
        "steps": [ {"check": str, "result": str, "flagged": bool}, ... ]
    }
    Raises ValueError if the invoice_id doesn't exist.
    """
    data = load_all()
    invoices = data["invoices"]
    purchase_orders = data["purchase_orders"]
    vendors = data["vendors"]
    approvals = data["approvals"]

    inv_row = invoices[invoices["invoice_id"] == invoice_id]
    if inv_row.empty:
        raise ValueError(f"Invoice {invoice_id} not found")
    inv = inv_row.iloc[0]

    vendor_row = vendors[vendors["vendor_id"] == inv["vendor_id"]]
    vendor = vendor_row.iloc[0] if not vendor_row.empty else None

    po_row = purchase_orders[purchase_orders["po_id"] == inv["po_id"]] if inv["po_id"] else None
    po = po_row.iloc[0] if po_row is not None and not po_row.empty else None

    approval_row = approvals[approvals["invoice_id"] == invoice_id]
    approval = approval_row.iloc[0] if not approval_row.empty else None

    steps = []

    # Step 1: Invoice basics
    steps.append({
        "check": "invoice_amount",
        "result": f"Invoice amount is ₹{inv['amount']:,.0f}",
        "flagged": False
    })

    # Step 2: PO check
    if po is None:
        steps.append({
            "check": "purchase_order",
            "result": "No matching purchase order found for this invoice",
            "flagged": True
        })
    else:
        po_amount = float(po["amount"])
        diff_pct = ((inv["amount"] - po_amount) / po_amount) * 100
        flagged = bool(diff_pct > 15)
        steps.append({
            "check": "purchase_order",
            "result": f"PO {po['po_id']} amount is ₹{po_amount:,.0f} ({diff_pct:+.0f}% vs invoice)",
            "flagged": flagged
        })

    # Step 3: Vendor history check
    if vendor is not None:
        vendor_avg = float(vendor["avg_invoice_amount"])
        ratio = inv["amount"] / vendor_avg if vendor_avg else 0
        flagged = bool(ratio > 1.5)
        steps.append({
            "check": "vendor_history",
            "result": f"Vendor {vendor['name']}'s average invoice is ₹{vendor_avg:,.0f} (this invoice is {ratio:.1f}x)",
            "flagged": flagged
        })
        vendor_avg_val = vendor_avg
        vendor_name = vendor["name"]
    else:
        vendor_avg_val = None
        vendor_name = "Unknown"

    # Step 4: Approval timing check
    approval_minutes = None
    approver_id = None
    if approval is not None:
        approver_id = approval["approver_id"]
        approval_minutes = (approval["approved_at"] - approval["submitted_at"]).total_seconds() / 60
        flagged = approval_minutes < 10
        steps.append({
            "check": "approval_history",
            "result": f"Approved by {approver_id} in {approval_minutes:.0f} minute(s)",
            "flagged": flagged
        })

    return {
        "invoice_id": inv["invoice_id"],
        "invoice_amount": float(inv["amount"]),
        "po_id": inv["po_id"] if inv["po_id"] else None,
        "po_amount": float(po["amount"]) if po is not None else None,
        "vendor_id": inv["vendor_id"],
        "vendor_name": vendor_name,
        "vendor_avg": vendor_avg_val,
        "approver_id": approver_id,
        "approval_minutes": approval_minutes,
        "steps": steps,
    }


if __name__ == "__main__":
    for inv_id in ["INV003", "INV021", "INV045"]:
        trail = build_trail(inv_id)
        print(f"=== {inv_id} ===")
        for step in trail["steps"]:
            marker = "⚠" if step["flagged"] else "✓"
            print(f"  {marker} {step['result']}")
        print()