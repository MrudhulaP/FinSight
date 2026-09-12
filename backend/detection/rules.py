"""
FinSight - Detection Rules
Each function checks ONE thing and returns (triggered: bool, detail: str or None).
Keeping rules isolated makes them easy to test, tune, and explain individually.
"""

VENDOR_DEVIATION_THRESHOLD = 1.5   # invoice > 1.5x vendor's historical average
FAST_APPROVAL_MINUTES = 10         # approvals faster than this are suspicious
PO_MISMATCH_TOLERANCE = 1.15       # allow up to 15% over PO before flagging (normal variance)


def check_po_mismatch(invoice_amount: float, po_amount: float | None) -> tuple[bool, str | None]:
    """Flags when invoice amount exceeds its linked PO amount by more than the tolerance."""
    if po_amount is None or po_amount <= 0:
        return False, None
    if invoice_amount > po_amount * PO_MISMATCH_TOLERANCE:
        pct_over = ((invoice_amount - po_amount) / po_amount) * 100
        return True, f"Invoice exceeds PO amount by {pct_over:.0f}% (₹{invoice_amount:,.0f} vs PO ₹{po_amount:,.0f})"
    return False, None


def check_missing_po(po_id: str) -> tuple[bool, str | None]:
    """Flags invoices with no linked purchase order at all."""
    if not po_id or str(po_id).strip() == "":
        return True, "No matching purchase order found for this invoice"
    return False, None


def check_vendor_deviation(invoice_amount: float, vendor_avg: float) -> tuple[bool, str | None]:
    """Flags when invoice amount is far above the vendor's historical average."""
    if vendor_avg <= 0:
        return False, None
    ratio = invoice_amount / vendor_avg
    if ratio > VENDOR_DEVIATION_THRESHOLD:
        return True, f"Invoice is {ratio:.1f}x the vendor's historical average (₹{vendor_avg:,.0f})"
    return False, None


def check_fast_approval(approval_minutes: float) -> tuple[bool, str | None]:
    """Flags approvals that happened suspiciously quickly."""
    if approval_minutes < FAST_APPROVAL_MINUTES:
        return True, f"Approved in only {approval_minutes:.0f} minute(s) - unusually fast"
    return False, None


def check_duplicate_invoice(invoice_row, all_invoices, window_days: int = 5) -> tuple[bool, str | None]:
    """Flags invoices with the same vendor + amount submitted within a short window."""
    import pandas as pd

    same_vendor = all_invoices[all_invoices["vendor_id"] == invoice_row["vendor_id"]]
    same_amount = same_vendor[same_vendor["amount"] == invoice_row["amount"]]
    # exclude itself
    same_amount = same_amount[same_amount["invoice_id"] != invoice_row["invoice_id"]]

    if same_amount.empty:
        return False, None

    this_date = pd.to_datetime(invoice_row["date"])
    for _, other in same_amount.iterrows():
        other_date = pd.to_datetime(other["date"])
        if abs((this_date - other_date).days) <= window_days:
            return True, f"Duplicate of {other['invoice_id']} - same vendor and amount within {window_days} days"

    return False, None