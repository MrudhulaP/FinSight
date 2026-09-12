"""
FinSight - Data Loader
Loads all seed CSVs into pandas DataFrames. Every other module should import
from here rather than reading CSVs directly, so there's one source of truth.
"""

import pandas as pd
import os

SEED_DIR = os.path.join(os.path.dirname(__file__), "seed")


def load_vendors() -> pd.DataFrame:
    return pd.read_csv(os.path.join(SEED_DIR, "vendors.csv"))


def load_purchase_orders() -> pd.DataFrame:
    return pd.read_csv(os.path.join(SEED_DIR, "purchase_orders.csv"))


def load_invoices() -> pd.DataFrame:
    df = pd.read_csv(os.path.join(SEED_DIR, "invoices.csv"))
    # po_id can be blank for orphan invoices - keep as empty string, not NaN
    df["po_id"] = df["po_id"].fillna("")
    return df


def load_approvals() -> pd.DataFrame:
    df = pd.read_csv(os.path.join(SEED_DIR, "approvals.csv"))
    df["submitted_at"] = pd.to_datetime(df["submitted_at"])
    df["approved_at"] = pd.to_datetime(df["approved_at"])
    return df


def load_transactions() -> pd.DataFrame:
    return pd.read_csv(os.path.join(SEED_DIR, "transactions.csv"))


def load_all() -> dict:
    """Convenience loader - returns every table in one dict."""
    return {
        "vendors": load_vendors(),
        "purchase_orders": load_purchase_orders(),
        "invoices": load_invoices(),
        "approvals": load_approvals(),
        "transactions": load_transactions(),
    }


if __name__ == "__main__":
    data = load_all()
    for name, df in data.items():
        print(f"{name}: {len(df)} rows")
        print(df.head(2))
        print()