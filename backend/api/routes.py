"""
FinSight - API Routes
Exposes the detection + investigation + OpenAI pipeline over HTTP for the
frontend to consume.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from fastapi import APIRouter, HTTPException

from detection.anomaly_detector import detect_anomalies
from investigation.trail_builder import build_trail
from reasoning.prompts import build_narration_prompt
from reasoning.openai_client import generate_explanation

router = APIRouter()


@router.get("/anomalies")
def get_anomalies():
    """Returns the list of flagged invoices with risk level + reasons."""
    flagged = detect_anomalies()
    return {
        "count": len(flagged),
        "anomalies": flagged,
    }


@router.get("/trail/{invoice_id}")
def get_trail(invoice_id: str):
    """Returns the evidence trail for one invoice, plus an OpenAI-generated explanation."""
    try:
        trail = build_trail(invoice_id)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Invoice {invoice_id} not found")

    prompt = build_narration_prompt(trail)

    try:
        explanation = generate_explanation(prompt)
    except Exception as e:
        # Don't let a missing/broken API key take down the whole endpoint -
        # still return the evidence trail, just flag that the explanation failed.
        explanation = f"(AI explanation unavailable: {e})"

    return {
        "trail": trail,
        "explanation": explanation,
    }