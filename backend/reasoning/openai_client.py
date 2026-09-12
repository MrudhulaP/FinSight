"""
FinSight - Gemini AI Client

Gemini is used only to explain evidence already collected
by FinSight's deterministic investigation engine.
"""

import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

_client = None


def get_client():
    """Create and reuse the Gemini client."""

    global _client

    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY not set. Add it to your backend .env file."
            )

        _client = genai.Client(api_key=api_key)

    return _client


def generate_explanation(
    prompt: str,
    model: str = "gemini-3.5-flash-lite",
) -> str:
    """
    Generate an evidence-grounded explanation.

    Primary model:
        Gemini 3.5 Flash-Lite

    Fallback model:
        Gemini 2.5 Flash-Lite

    Both are suitable for the free-tier prototype.
    """

    client = get_client()

    models_to_try = [
        model,
        "gemini-2.5-flash-lite",
    ]

    last_error = None

    for current_model in models_to_try:
        try:
            response = client.models.generate_content(
                model=current_model,
                contents=prompt,
            )

            if response.text:
                return response.text.strip()

        except Exception as error:
            last_error = error

            # Try the fallback model if the first model
            # is temporarily unavailable.
            continue

    return (
        "AI explanation temporarily unavailable. "
        "The evidence trail remains available for analyst review. "
        f"Reason: {last_error}"
    )


if __name__ == "__main__":
    print("Testing FinSight Gemini connection...")

    test_prompt = (
        "Respond with exactly: "
        "FinSight Gemini connection working."
    )

    print(generate_explanation(test_prompt))