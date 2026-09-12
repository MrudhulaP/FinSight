"""
FinSight - API Routes

Exposes the detection, investigation, AI reasoning,
and cash-flow analysis pipelines over HTTP.
"""

import os
import sys

import pandas as pd
from fastapi import APIRouter, HTTPException

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from detection.anomaly_detector import detect_anomalies
from investigation.trail_builder import build_trail
from reasoning.prompts import build_narration_prompt
from reasoning.openai_client import generate_explanation
from data.loader import load_all

router = APIRouter()


# ============================================================
# ANOMALIES
# ============================================================

@router.get("/anomalies")
def get_anomalies():
    """Return flagged invoices with risk level and detection reasons."""

    flagged = detect_anomalies()

    return {
        "count": len(flagged),
        "anomalies": flagged,
    }


# ============================================================
# INVESTIGATION TRAIL + GEMINI
# ============================================================

@router.get("/trail/{invoice_id}")
def get_trail(invoice_id: str):
    """
    Return the evidence trail for one invoice
    plus the Gemini-generated explanation.
    """

    try:
        trail = build_trail(invoice_id)

    except ValueError:
        raise HTTPException(
            status_code=404,
            detail=f"Invoice {invoice_id} not found",
        )

    prompt = build_narration_prompt(trail)

    try:
        explanation = generate_explanation(prompt)

    except Exception as error:
        explanation = (
            "AI explanation unavailable. "
            "The evidence trail remains available for analyst review. "
            f"Reason: {error}"
        )

    return {
        "trail": trail,
        "explanation": explanation,
    }


# ============================================================
# CASH FLOW
# ============================================================

@router.get("/cashflow")
def get_cashflow():
    """
    Return cash-flow analytics derived from the real transaction dataset.

    The current dataset contains transaction amounts and dates,
    but does not contain a separate inflow/outflow field.

    Therefore:
    - transaction totals are treated as observed transaction outflow
    - no artificial inflow value is created
    - forecast is based on historical monthly transaction outflow
    """

    try:
        # load_all() returns a dictionary.
        # Extract the actual transactions DataFrame by key.
        data = load_all()
        transactions = data["transactions"]

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load transaction data: {error}",
        )

    if transactions is None or transactions.empty:
        return {
            "currency": "INR",
            "has_inflow_data": False,
            "current_balance": None,
            "total_inflow": None,
            "total_outflow": 0,
            "net_cash_flow": None,
            "average_monthly_outflow": 0,
            "latest_month_outflow": 0,
            "forecast_monthly_outflow": 0,
            "historical": [],
            "forecast": [],
            "message": (
                "No transaction data is available for cash-flow analysis."
            ),
        }

    df = transactions.copy()

    # ========================================================
    # VALIDATE REQUIRED COLUMNS
    # ========================================================

    required_columns = {"amount", "date"}

    missing_columns = required_columns - set(df.columns)

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail=(
                "Cash-flow data is missing required columns: "
                + ", ".join(sorted(missing_columns))
            ),
        )

    # ========================================================
    # CLEAN DATA
    # ========================================================

    df["amount"] = pd.to_numeric(
        df["amount"],
        errors="coerce",
    )

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce",
    )

    df = df.dropna(
        subset=["amount", "date"]
    )

    if df.empty:
        return {
            "currency": "INR",
            "has_inflow_data": False,
            "current_balance": None,
            "total_inflow": None,
            "total_outflow": 0,
            "net_cash_flow": None,
            "average_monthly_outflow": 0,
            "latest_month_outflow": 0,
            "forecast_monthly_outflow": 0,
            "historical": [],
            "forecast": [],
            "message": (
                "No valid transaction records are available."
            ),
        }

    # ========================================================
    # MONTHLY HISTORICAL CASH MOVEMENT
    # ========================================================

    df["month"] = df["date"].dt.to_period("M")

    monthly = (
        df.groupby("month")["amount"]
        .sum()
        .reset_index()
        .sort_values("month")
    )

    historical = []

    for _, row in monthly.iterrows():
        period = row["month"]

        historical.append(
            {
                "month": period.strftime("%b %Y"),
                "short_month": period.strftime("%b"),
                "year": int(period.year),
                "outflow": round(
                    float(row["amount"]),
                    2,
                ),
                "inflow": None,
                "net": None,
                "type": "historical",
            }
        )

    # ========================================================
    # FORECAST
    # ========================================================
    # Transparent 3-month moving average.
    # No AI is used for numerical forecasting.

    monthly_values = monthly["amount"].tolist()

    if monthly_values:
        recent_values = monthly_values[-3:]

        forecast_amount = (
            sum(recent_values) / len(recent_values)
        )
    else:
        forecast_amount = 0

    last_period = monthly["month"].iloc[-1]

    forecast = []

    for month_offset in range(1, 4):

        future_period = (
            last_period + month_offset
        )

        forecast.append(
            {
                "month": future_period.strftime("%b %Y"),
                "short_month": future_period.strftime("%b"),
                "year": int(future_period.year),
                "outflow": round(
                    float(forecast_amount),
                    2,
                ),
                "inflow": None,
                "net": None,
                "type": "forecast",
            }
        )

    # ========================================================
    # SUMMARY
    # ========================================================

    total_outflow = float(
        df["amount"].sum()
    )

    average_monthly_outflow = float(
        monthly["amount"].mean()
    )

    latest_month_outflow = float(
        monthly["amount"].iloc[-1]
    )

    return {
        "currency": "INR",
        "has_inflow_data": False,
        "current_balance": None,
        "total_inflow": None,

        "total_outflow": round(
            total_outflow,
            2,
        ),

        "net_cash_flow": None,

        "average_monthly_outflow": round(
            average_monthly_outflow,
            2,
        ),

        "latest_month_outflow": round(
            latest_month_outflow,
            2,
        ),

        "forecast_monthly_outflow": round(
            float(forecast_amount),
            2,
        ),

        "historical": historical,
        "forecast": forecast,

        "message": (
            "Cash-flow analysis is based on transaction amounts. "
            "The current dataset does not contain separate inflow "
            "records, so inflow and net cash flow are not estimated."
        ),
    }