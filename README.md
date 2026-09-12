# FinSight AI

> **From anomaly to evidence.**

FinSight AI is an AI-assisted financial investigation platform built for **HackDriven — Round 2, Track 3: Finance**.

Instead of stopping at anomaly detection, FinSight connects suspicious financial events to supporting evidence, builds an investigation trail, scores risk, and uses **Google Gemini** to explain findings and recommend actions.

---

## 🚀 Live Demo

**Live Portal:** Coming soon — deployment URL will be added after deployment.

---

## 🎯 What FinSight AI Does

FinSight follows this investigation pipeline:

**Financial Data → Processing → Anomaly Detection → Risk Score → Evidence Collection → Investigation Engine → Gemini Reasoning → Explainable Investigation → Recommended Action**

The system separates numerical financial analysis from AI reasoning. The backend detects anomalies and provides structured evidence, while Gemini explains the evidence without inventing financial facts.

---

## ✨ Key Features

### 🔎 Anomaly Detection

- Purchase order vs invoice amount mismatch
- Unusually large vendor invoices
- Vendor spending spikes
- Possible duplicate invoices
- Unusual approval timing
- Unusual transaction timing
- Risk classification: **High / Medium / Low**

### 🧩 Investigation Engine

FinSight connects related financial records into an evidence chain:

**Invoice → Purchase Order → Vendor History → Approval History → Related Transactions**

This helps investigators understand **why** a transaction was flagged instead of simply showing an anomaly score.

### 🤖 Gemini AI Investigation

Google Gemini helps:

- Summarize investigations
- Explain suspicious transactions
- Reason over structured evidence
- Highlight important risk factors
- Recommend appropriate actions

### 📊 Financial Dashboard

- Financial risk overview
- Flagged transaction value
- Anomaly distribution
- Investigation summaries
- Interactive charts

### 💸 Cash Flow Forecasting

- Historical transaction trends
- Monthly financial movement
- Statistical forecasting
- Forecast visualization

### 💬 AI Financial Assistant

A conversational interface for asking questions about financial data and investigation results.

---

## 🏗️ Architecture

```text
React + Vite + Tailwind
          │
          ▼
       FastAPI
          │
          ▼
   Pandas / NumPy
          │
          ▼
 Anomaly Detection
          │
          ▼
 Investigation Engine
          │
          ▼
    Gemini Reasoning
          │
          ▼
 Explainable Results


 #PROJECT STRUCTURE
FinSight/
├── backend/
│   ├── api/
│   ├── data/
│   ├── detection/
│   ├── investigation/
│   ├── reasoning/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── Dashboard.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md