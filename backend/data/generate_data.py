"""
FinSight - Synthetic Data Generator
Creates 5 linked CSVs with realistic financial data, plus a handful of
deliberately planted anomalies for the demo (PO mismatch, vendor deviation,
suspiciously fast approval, duplicate invoice).

Run: python generate_data.py
Output: ./seed/*.csv
"""

import pandas as pd
import random
from datetime import datetime, timedelta

random.seed(42)  # reproducible output

OUT_DIR = "seed"
import os
os.makedirs(OUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# 1. VENDORS
# ---------------------------------------------------------------------------
VENDOR_NAMES = [
    "ABC Ltd", "XYZ Ltd", "Sterling Supplies", "Nova Traders", "Orion Corp",
    "BlueWave Industries", "Crescent Logistics", "Pioneer Materials",
    "Vertex Solutions", "Harbor Manufacturing", "Zenith Enterprises",
    "Meridian Goods", "Coastal Equipment", "Summit Vendors", "Delta Systems"
]

vendors = []
for i, name in enumerate(VENDOR_NAMES, start=1):
    vendor_id = f"V{i:03d}"
    avg_invoice_amount = random.randint(80_000, 250_000)
    vendors.append({
        "vendor_id": vendor_id,
        "name": name,
        "avg_invoice_amount": avg_invoice_amount,
        "first_seen_date": (datetime(2024, 1, 1) + timedelta(days=random.randint(0, 300))).strftime("%Y-%m-%d")
    })

vendors_df = pd.DataFrame(vendors)
vendors_df.to_csv(f"{OUT_DIR}/vendors.csv", index=False)

# ---------------------------------------------------------------------------
# 2. PURCHASE ORDERS
# ---------------------------------------------------------------------------
DEPARTMENTS = ["Procurement", "Operations", "IT", "Marketing", "Facilities", "HR"]

purchase_orders = []
po_counter = 1
NUM_POS = 150

for _ in range(NUM_POS):
    vendor = random.choice(vendors)
    po_id = f"PO{po_counter:03d}"
    po_counter += 1
    # PO amount roughly near vendor's average, with normal variance
    amount = int(vendor["avg_invoice_amount"] * random.uniform(0.7, 1.2))
    purchase_orders.append({
        "po_id": po_id,
        "vendor_id": vendor["vendor_id"],
        "amount": amount,
        "department": random.choice(DEPARTMENTS),
        "created_date": (datetime(2025, 1, 1) + timedelta(days=random.randint(0, 240))).strftime("%Y-%m-%d"),
        "status": "approved"
    })

po_df = pd.DataFrame(purchase_orders)
po_df.to_csv(f"{OUT_DIR}/purchase_orders.csv", index=False)

# ---------------------------------------------------------------------------
# 3. INVOICES  (most normal, a few deliberately planted as anomalies)
# ---------------------------------------------------------------------------
invoices = []
NUM_INVOICES = 180

# IDs reserved for deliberately planted anomalies below - normal loop must skip these
RESERVED_IDS = {3, 21, 22, 45}

# Reserve some PO/vendor pairs to use for planted anomalies at the end
po_pool = purchase_orders.copy()
random.shuffle(po_pool)

inv_counter = 1
for i in range(NUM_INVOICES):
    while inv_counter in RESERVED_IDS:
        inv_counter += 1
    po = po_pool[i % len(po_pool)]
    vendor = next(v for v in vendors if v["vendor_id"] == po["vendor_id"])
    inv_id = f"INV{inv_counter:03d}"
    inv_counter += 1

    base_date = datetime.strptime(po["created_date"], "%Y-%m-%d") + timedelta(days=random.randint(1, 20))
    # Normal invoice: close to PO amount, submitted during business hours
    amount = int(po["amount"] * random.uniform(0.95, 1.05))
    hour = random.randint(9, 18)
    minute = random.randint(0, 59)

    invoices.append({
        "invoice_id": inv_id,
        "vendor_id": po["vendor_id"],
        "po_id": po["po_id"],
        "amount": amount,
        "date": base_date.strftime("%Y-%m-%d"),
        "time": f"{hour:02d}:{minute:02d}"
    })

# --- Planted anomalies (clearly demoable) -------------------------------

# Anomaly 1: Invoice far exceeds PO amount + vendor average, submitted late at night
anomaly_vendor = vendors[0]  # ABC Ltd
anomaly_po = next(p for p in purchase_orders if p["vendor_id"] == anomaly_vendor["vendor_id"])
invoices.append({
    "invoice_id": "INV003",
    "vendor_id": anomaly_vendor["vendor_id"],
    "po_id": anomaly_po["po_id"],
    "amount": int(anomaly_po["amount"] * 2.3),   # way over PO
    "date": "2025-09-04",
    "time": "23:47"
})

# Anomaly 2: Duplicate invoice - same vendor, same amount, submitted twice within days
dup_vendor = vendors[1]  # XYZ Ltd
dup_po = next(p for p in purchase_orders if p["vendor_id"] == dup_vendor["vendor_id"])
dup_amount = int(dup_po["amount"] * 1.02)
invoices.append({
    "invoice_id": "INV021",
    "vendor_id": dup_vendor["vendor_id"],
    "po_id": dup_po["po_id"],
    "amount": dup_amount,
    "date": "2025-09-05",
    "time": "14:10"
})
invoices.append({
    "invoice_id": "INV022",
    "vendor_id": dup_vendor["vendor_id"],
    "po_id": dup_po["po_id"],
    "amount": dup_amount,
    "date": "2025-09-06",
    "time": "10:05"
})

# Anomaly 3: Invoice has no matching PO at all (po_id blank / invalid)
orphan_vendor = vendors[2]
invoices.append({
    "invoice_id": "INV045",
    "vendor_id": orphan_vendor["vendor_id"],
    "po_id": "",  # missing PO
    "amount": int(orphan_vendor["avg_invoice_amount"] * 1.8),
    "date": "2025-09-07",
    "time": "16:20"
})

invoices_df = pd.DataFrame(invoices)
invoices_df.to_csv(f"{OUT_DIR}/invoices.csv", index=False)

# ---------------------------------------------------------------------------
# 4. APPROVALS
# ---------------------------------------------------------------------------
APPROVERS = ["EMP001", "EMP002", "EMP003", "EMP004", "EMP005"]

approvals = []
appr_counter = 1

for inv in invoices:
    approver = random.choice(APPROVERS)
    submitted_dt = datetime.strptime(f"{inv['date']} {inv['time']}", "%Y-%m-%d %H:%M")

    if inv["invoice_id"] == "INV003":
        # Planted anomaly: approved suspiciously fast (2 minutes)
        approved_dt = submitted_dt + timedelta(minutes=2)
    elif inv["invoice_id"] in ("INV021", "INV022"):
        approved_dt = submitted_dt + timedelta(minutes=3)
    else:
        # Normal approval delay: 1 hour to 3 days
        approved_dt = submitted_dt + timedelta(minutes=random.randint(60, 4320))

    approvals.append({
        "approval_id": f"APR{appr_counter:03d}",
        "invoice_id": inv["invoice_id"],
        "approver_id": approver,
        "submitted_at": submitted_dt.strftime("%Y-%m-%d %H:%M"),
        "approved_at": approved_dt.strftime("%Y-%m-%d %H:%M")
    })
    appr_counter += 1

approvals_df = pd.DataFrame(approvals)
approvals_df.to_csv(f"{OUT_DIR}/approvals.csv", index=False)

# ---------------------------------------------------------------------------
# 5. TRANSACTIONS (payment records linked to invoices)
# ---------------------------------------------------------------------------
transactions = []
txn_counter = 1

for inv in invoices:
    approval = next(a for a in approvals if a["invoice_id"] == inv["invoice_id"])
    txn_date = datetime.strptime(approval["approved_at"], "%Y-%m-%d %H:%M") + timedelta(days=random.randint(0, 3))
    transactions.append({
        "txn_id": f"TXN{txn_counter:03d}",
        "invoice_id": inv["invoice_id"],
        "amount": inv["amount"],
        "date": txn_date.strftime("%Y-%m-%d")
    })
    txn_counter += 1

transactions_df = pd.DataFrame(transactions)
transactions_df.to_csv(f"{OUT_DIR}/transactions.csv", index=False)

# ---------------------------------------------------------------------------
print("Data generation complete.")
print(f"  vendors.csv          -> {len(vendors_df)} rows")
print(f"  purchase_orders.csv  -> {len(po_df)} rows")
print(f"  invoices.csv         -> {len(invoices_df)} rows")
print(f"  approvals.csv        -> {len(approvals_df)} rows")
print(f"  transactions.csv     -> {len(transactions_df)} rows")
print("\nPlanted anomalies for demo:")
print("  INV003 - amount far exceeds PO + vendor avg, submitted 23:47, approved in 2 min")
print("  INV021/INV022 - duplicate invoice, same vendor+amount, submitted 2 days apart")
print("  INV045 - no matching PO (orphan invoice)")