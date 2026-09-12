"""
FinSight - OpenAI Client
Thin wrapper around the OpenAI API. Keeps the API call in one place so the
model/params can be tuned without touching business logic elsewhere.
"""

import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

_client = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "OPENAI_API_KEY not set. Add it to your .env file."
            )
        _client = OpenAI(api_key=api_key)
    return _client

def generate_explanation(prompt: str, model: str = "gpt-4o-mini", timeout: float = 15.0) -> str:
    """Sends a prompt to OpenAI and returns the text response.
    Falls back to a mock explanation if credits are exhausted or API fails."""
    try:
        client = get_client()
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,   # lower temperature = more consistent, factual output
            timeout=timeout,
        )
        return response.choices[0].message.content
    except Exception:
        # 👇 Paste your mock explanation here
        return (
            "This invoice was flagged because it has no matching purchase order "
            "and is significantly higher than the vendor's average. Approval timing looks normal."
        )

if __name__ == "__main__":
    # Quick manual test
    test_prompt = "Say 'FinSight OpenAI connection working' and nothing else."
    print(generate_explanation(test_prompt))
