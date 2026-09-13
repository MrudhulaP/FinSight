# FinSight AI

> **From anomaly to evidence.**

FinSight AI is an AI-assisted financial investigation platform built for **HackDriven — Round 2, Track 3: Finance**.

Instead of stopping at anomaly detection, FinSight investigates suspicious financial transactions by connecting them with related financial records, building an evidence trail, and using AI to generate an understandable explanation of the findings.

---

## Live Demo: 

https://fin-sight-lemon.vercel.app/

<img width="1917" height="1026" alt="Screenshot 2026-09-13 173807" src="https://github.com/user-attachments/assets/9d2f7667-192b-461f-b574-adf4586ee18f" />

The live application provides the FinSight financial intelligence interface.

---

## Problem

Financial teams process large amounts of invoices, purchase orders, vendor transactions, approvals, and other financial records.

Traditional anomaly-detection systems can identify unusual transactions, but a risk score alone does not answer the most important question:

> **Why is this transaction suspicious?**

Investigating that question usually requires manually checking multiple related records.

This creates three major challenges:

* Large volumes of financial data are difficult to investigate manually.
* Anomaly scores often lack sufficient context.
* Analysts need to cross-reference multiple records before making a decision.

---

## Our Solution

FinSight combines anomaly detection with an automated investigation workflow.

Instead of:

```text
Transaction
     ↓
Anomaly Detection
     ↓
Risk Score
```

FinSight follows:

```text
Financial Data
     ↓
Processing
     ↓
Anomaly Detection
     ↓
Risk Classification
     ↓
Evidence Collection
     ↓
Investigation Trail
     ↓
AI Reasoning
     ↓
Explainable Findings
     ↓
Recommended Action
```

The system separates **financial analysis** from **AI reasoning**.

The backend identifies anomalies and gathers structured evidence, while the AI layer converts that evidence into a human-readable explanation.

---

# What Makes FinSight Different?

## Anomaly Investigation — Not Just Anomaly Detection

Many financial systems focus on identifying unusual transactions.

FinSight goes one step further.

When a transaction is flagged, the system investigates related information such as:

```text
Invoice
   ↓
Purchase Order
   ↓
Vendor History
   ↓
Approval History
   ↓
Related Transactions
```

This produces an **investigation trail** that helps the user understand the evidence behind a risk flag.

### Traditional approach

> "Invoice #INV003 has a high risk score."

### FinSight approach

> "Invoice #INV003 is high risk because its value exceeds the associated purchase order, differs significantly from the vendor's historical pattern, and shows additional unusual activity."

The goal is to make financial anomaly detection more **explainable, contextual, and actionable**.

---

# Key Features

## 1. Anomaly Detection

FinSight identifies potentially suspicious financial activity using financial patterns and anomaly indicators.

Examples include:

* Purchase order vs. invoice amount mismatch
* Unusually large vendor invoices
* Vendor spending spikes
* Possible duplicate invoices
* Unusual approval timing
* Unusual transaction timing
* Risk classification

The detection layer provides the initial signal that a transaction requires investigation.

---

## 2. Investigation Engine

The investigation engine connects related financial records to build an evidence chain.

<img width="1625" height="1010" alt="image" src="https://github.com/user-attachments/assets/0c4f4e3e-b446-4db4-a045-a8bcdd07861d" />


```text
Invoice
   ↓
Purchase Order
   ↓
Vendor History
   ↓
Approval History
   ↓
Related Transactions
```

Rather than presenting an isolated anomaly score, FinSight provides the surrounding financial context.

This is the **core differentiator of the project**.

---

## 3. AI-Powered Investigation

The AI layer takes the structured evidence collected by the investigation engine and produces a human-readable explanation.

<img width="1917" height="1025" alt="Screenshot 2026-09-13 173947" src="https://github.com/user-attachments/assets/d0dc9678-128d-4b6c-b586-c5e1fe5f3035" />


It can help:

* Summarize an investigation
* Explain suspicious transactions
* Identify important risk factors
* Reason over the collected financial evidence
* Generate recommended next actions

### Important design principle

The AI is not expected to independently determine whether a transaction is fraudulent.

Instead:

```text
Financial Analysis
       ↓
Evidence
       ↓
AI Reasoning
       ↓
Explanation
```

This keeps the financial evidence and AI-generated interpretation clearly separated.

---

## 4. Financial Risk Dashboard

The frontend provides a centralized view of the financial analysis.

The dashboard is designed to surface information such as:

* Financial risk overview
* Flagged transactions
* Risk levels
* Anomaly distribution
* Investigation information
* Financial charts
* AI-generated explanations

Users can move from an overall financial view to an individual investigation.

---

## 5. Cash-Flow Forecasting

FinSight includes a forecasting component for analyzing historical financial movement and estimating future trends.

The forecasting view can help users understand:

* Historical transaction trends
* Monthly financial movement
* Expected financial patterns
* Forecasted values

---

## 6. AI Financial Assistant

FinSight also provides a conversational interface for interacting with financial information.

Users can ask questions about available financial data and investigation results.

Example questions:

```text
Which transactions have been flagged as high risk?

Which vendors have unusual spending patterns?

Why was this transaction flagged?

Which invoices have PO mismatches?
```

---

# Architecture

```text
                    ┌──────────────────────┐
                    │    Financial Data    │
                    │                      │
                    │ Invoices             │
                    │ Purchase Orders      │
                    │ Vendors              │
                    │ Approvals            │
                    │ Transactions         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Data Processing     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Anomaly Detection    │
                    │ ML + Financial Rules │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Suspicious           │
                    │ Transaction          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Investigation Engine │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
          Purchase Order   Vendor History   Approval History
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Evidence Trail     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    AI Reasoning      │
                    │                      │
                    │ Explanation +        │
                    │ Recommendation       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   FinSight Dashboard │
                    └──────────────────────┘
```

---

# Investigation Workflow

### Step 1 — Financial Data

The system works with structured financial information such as invoices, purchase orders, vendor records, approvals, and transactions.

### Step 2 — Anomaly Detection

The detection layer identifies transactions that deviate from expected financial patterns.

### Step 3 — Risk Classification

Flagged transactions are categorized according to their detected risk indicators.

### Step 4 — Evidence Collection

The investigation engine retrieves related financial records.

For example:

```text
Invoice INV003
      │
      ├── PO103
      ├── Vendor ABC Supplies
      ├── Approval Record
      └── Historical Transactions
```

### Step 5 — Investigation Trail

The related records are combined into an evidence chain.

### Step 6 — AI Reasoning

The collected evidence is passed to the AI layer for explanation and interpretation.

### Step 7 — Explainable Result

The user receives:

* Risk information
* Supporting evidence
* Investigation summary
* AI-generated explanation
* Suggested next action

---

# Example Investigation

Consider a suspicious invoice:

```text
Invoice ID: INV003
Vendor: ABC Supplies

Invoice Amount: ₹4,80,000
PO Amount: ₹2,10,000
Vendor Historical Average: ₹1,65,000
Approval Time: 2 minutes
```

The system can identify multiple risk indicators:

```text
⚠ Invoice amount exceeds PO amount

⚠ Invoice amount is significantly above
  the vendor's historical pattern

⚠ Approval activity is unusually fast
```

Instead of simply showing:

```text
Risk Score: 0.91
```

FinSight builds an investigation trail containing the supporting evidence.

The AI layer can then convert that evidence into a concise explanation for the financial analyst.

---

# Technology Stack

## Backend

* **Python**
* **FastAPI**
* **Pandas**
* **NumPy**
* **Scikit-learn**
* **python-dotenv**

The current backend dependency configuration also includes an AI SDK for the configured reasoning provider.

## Frontend

* **React**
* **Vite**
* **Tailwind CSS**
* **React Router**
* **Recharts**
* **Lucide React**

These dependencies are reflected in the current frontend configuration.

## AI

* AI-powered reasoning and explanation layer
* Structured evidence passed to the model
* Human-readable investigation summaries

---

# Project Structure

The current repository is organized around separate backend and frontend applications.

```text
FinSight/
│
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
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── LICENSE
└── README.md
```

---

# Getting Started

## Prerequisites

Make sure you have installed:

* Python 3.10+
* Node.js
* npm

---

## 1. Clone the repository

```bash
git clone https://github.com/MrudhulaP/FinSight.git
cd FinSight
```

---

# Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# Environment Configuration

Create a `.env` file inside the backend directory if required by the implementation.

Example:

```env
GEMINI_API_KEY=your_api_key_here
```

**Never commit your actual API key to GitHub.**

Use `.env` to document required environment variables without exposing secrets.

---

# Run the Backend

From the `backend` directory:

```bash
uvicorn main:app --reload
```

The FastAPI backend will start locally.

---

# Frontend Setup

Open another terminal and navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide the local development URL in the terminal.

---

# System Communication

The frontend communicates with the FastAPI backend to retrieve financial analysis and investigation information.

The overall communication pattern is:

```text
React Frontend
      ↓
FastAPI API
      ↓
Financial Analysis
      ↓
Investigation Engine
      ↓
AI Reasoning
      ↓
API Response
      ↓
React Dashboard
```

---

# Detection & Investigation Logic

FinSight combines different financial indicators rather than relying on one signal.

### Purchase Order Mismatch

```text
Invoice Amount ≠ Purchase Order Amount
```

A significant mismatch can indicate a transaction requiring further investigation.

### Vendor Spending Spike

The current invoice is compared with historical vendor behavior.

### Duplicate Invoice

Potentially repeated invoice information can be identified.

### Approval Anomaly

Unusual approval behavior can be considered an additional investigation signal.

### Transaction Timing

Transactions occurring at unusual times or patterns can receive additional attention.

The exact detection logic can be extended as the project evolves.

---

# Explainability

A central design principle of FinSight is that the AI explanation should be grounded in evidence collected by the financial analysis layer.

Instead of asking the model to make an unsupported decision:

```text
"Is this fraud?"
```

the system provides structured evidence:

```text
Invoice amount: ₹4,80,000
PO amount: ₹2,10,000
Historical vendor average: ₹1,65,000
Approval time: 2 minutes
```

The AI then explains the significance of these findings.

This makes the output easier for a human analyst to review.

---

# Target Users

FinSight is intended as a decision-support tool for:

* Financial analysts
* Finance teams
* Accounts payable teams
* Internal audit teams
* Compliance teams
* Fraud investigation teams
* Finance managers

---

# Use Cases

### Invoice Investigation

Identify invoices that require additional review.

### Vendor Risk Monitoring

Identify unusual changes in vendor transaction behavior.

### Financial Audit Support

Provide evidence trails that help analysts investigate transactions.

### Transaction Monitoring

Surface unusual financial activity for human review.

### Financial Decision Support

Provide understandable explanations around detected financial patterns.

---

# Current Scope

FinSight is currently a prototype demonstrating the core concept of explainable financial investigation.

The primary workflow is:

```text
Detection
   ↓
Investigation
   ↓
Evidence
   ↓
AI Explanation
   ↓
Dashboard
```

The project is designed to demonstrate the concept rather than replace a production financial fraud or audit platform.

---

# Future Scope

Future versions can include:

* Real-time transaction monitoring
* ERP/accounting-system integration
* Advanced fraud-detection models
* Automated alerts
* Advanced cash-flow forecasting
* Enterprise database integration
* Role-based access control
* Audit logs
* Human feedback loops
* Investigation prioritization
* Additional financial data sources
* Production-scale deployment

---

# Disclaimer

FinSight is a prototype for financial intelligence and decision-support purposes.

AI-generated explanations and anomaly classifications should be reviewed by qualified financial professionals before being used for real financial, compliance, or fraud-related decisions.

A flagged transaction should not automatically be treated as fraudulent.

---

# Team

Developed collaboratively as part of a hackathon project focused on:

* Artificial Intelligence
* Financial Intelligence
* Anomaly Detection
* Explainable AI
* Automated Investigation
* Decision Support

### Contributors

* **Mrudhula P**
* **Dishant Surya Tej**
* **Vijayalakshmi H S**
* **Khushi Patil**

---

# License

This project is licensed under the **MIT License**.

See the [`LICENSE`](LICENSE) file for details.

---

# Project Highlight

> **FinSight doesn't just flag suspicious transactions — it investigates them.**

**Detect → Investigate → Explain → Act**
