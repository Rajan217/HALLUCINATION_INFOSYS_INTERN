# VeriAI — Milestone 3 Walkthrough & Verification Guide

## 🌟 Overview

**Milestone 3** delivers the complete evaluation, aggregation, visualization, and batch processing architecture for **VeriAI**:
1. **M3.1 — Completeness Judge Agent**: Assesses query aspect coverage, extracts sub-questions and expected reference/source facts, identifies specific omissions, and categorizes completeness (`FULLY_COMPLETE`, `MOSTLY_COMPLETE`, `PARTIALLY_COMPLETE`, `INCOMPLETE_OR_OMITTED`).
2. **M3.2 — Verdict Agent & Weighted Evaluation**: Synthesizes scores from all 4 Judge Agents using a weighted model (35% Hallucination, 25% Accuracy, 20% Relevance, 20% Completeness) to determine overall quality verdicts (`PASS`, `NEEDS_IMPROVEMENT`, `FAIL`) and generate executive reasoning summaries.
3. **M3.3 — Per-Dimension Scoring & Results Display**: Glassmorphic web UI displaying weighted composite gauges, 4 agent dimension meters, ground-truth evidence snippets, flagged hallucination claim cards, covered vs. missing aspects analysis, and executive verdict summaries.
4. **M3.4 — Batch Evaluation Module**: Automated CSV file upload, validation, parsing, error-resilient multi-row orchestration, aggregate batch metrics (Pass Rate %, Avg Composite Score, Hallucination Frequency Rate %), datatable search/filtering, detail inspection modal, and CSV export.

---

## 🛠️ Architecture & Core Components

```
+-----------------------------------------------------------------------------------+
|                        VeriAI Interactive Dashboard                               |
|        [ Single Evaluation | Batch CSV Evaluation | RAG KB | History ]            |
+-----------------------------------------------------------------------------------+
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
+-----------------------------------+           +-----------------------------------+
| POST /api/v1/evaluate             |           | POST /api/v1/evaluate/batch       |
| Single Submission Endpoint        |           | Batch CSV Upload Endpoint         |
+-----------------------------------+           +-----------------------------------+
                  │                                               │
                  └───────────────────────┬───────────────────────┘
                                          ▼
+-----------------------------------------------------------------------------------+
|                           Agent Orchestrator Pipeline                             |
+-----------------------------------------------------------------------------------+
         │                  │                       │                     │
         ▼                  ▼                       ▼                     ▼
+----------------+  +----------------+    +-------------------+   +--------------------+
| Relevance Judge|  | Accuracy Judge |    | Hallucination     |   | Completeness Judge |
| (Weight: 20%)  |  | (Weight: 25%)  |    | Detection Agent   |   | Agent (M3.1)       |
| • 5-Tier Scale |  | • Evidence     |    | (Weight: 35%)     |   | (Weight: 20%)      |
+----------------+  +----------------+    | • Sub-span Flags  |   | • Coverage/Omission|
                                          +-------------------+   +--------------------+
                                                    │
                                                    ▼
                                    +-------------------------------+
                                    | Verdict Agent Synthesis (M3.2)|
                                    | • Composite Score (0-100)     |
                                    | • Verdict: PASS/NEEDS_IMP/FAIL|
                                    | • Risk Tier: LOW/MEDIUM/HIGH  |
                                    | • Executive Summary Synthesis |
                                    +-------------------------------+
```

---

## 🚀 How to Run & Validate

### 1. Execute Unit & Integration Tests (23/23 Passing)
```bash
python run_tests.py
```

### 2. Execute Milestone 3 Agent & Batch Validation Suite
```bash
python run_m3_validation.py
```

### 3. Launch Web Server & Dashboard
```bash
python -m app.main
```
Open your browser to:
👉 **`http://localhost:8000`**

Open API Swagger Documentation:
👉 **`http://localhost:8000/docs`**

---

## 📁 File Structure Additions (Milestone 3)

- `app/agents/completeness_judge.py` — M3.1 Completeness Judge Agent.
- `app/agents/verdict_agent.py` — M3.2 Verdict Agent & Executive Summary Synthesis.
- `app/api/batch_evaluate.py` — M3.4 Batch Evaluation API Router (Upload CSV, parse, execute, export).
- `app/models/schema.py` — Data models updated with batch evaluation schemas and verdict categories.
- `app/static/index.html` — Updated UI layout with Completeness Breakdown Box, Batch CSV Evaluation Tab (`tab-batch`), and Inspection Modal.
- `app/static/styles.css` — Modern glassmorphism CSS styles for batch dropzone, metric cards, verdict distribution bar, and datatables.
- `app/static/app.js` — Frontend logic for batch CSV uploading, preset CSV generation, interactive filtering, inspect modal, and CSV export.
- `tests/test_m3_agents.py` — Unit tests for M3.1 & M3.2.
- `tests/test_batch_eval.py` — Unit tests for M3.4 batch CSV parsing & orchestration.
- `run_m3_validation.py` — Comprehensive validation runner script for Milestone 3.
