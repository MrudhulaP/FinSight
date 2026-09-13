"""
FinSight - Backend Entrypoint
Run with: uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router

app = FastAPI(title="FinSight API")

# Allow the frontend (running on a different port during dev) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://finsight.vercel.app"],  # or ["*"] for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {"status": "FinSight backend running"}