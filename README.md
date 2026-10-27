# VeriAI — LLM Evaluation & Multi-Agent Hallucination Detection Platform

> **Milestone 1, Milestone 2 & Milestone 3 Submission Complete**: LLM Evaluation Foundation, System Architecture, RAG Reference Knowledge Base (TruthfulQA & SQuAD), Evaluation Judge Agents (Relevance, Accuracy, Hallucination Detection, Completeness), Verdict Agent & Executive Summary Synthesis, Per-Dimension Interactive Results Dashboard, and Automated CSV Batch Evaluation Module.

---

## 🌟 Overview

**VeriAI** is an enterprise-grade LLM evaluation, RAG benchmarking, and hallucination detection framework. It evaluates AI-generated responses against user prompts, reference ground truths, and benchmark knowledge bases using a specialized multi-agent architecture.

### Key Capabilities
- **Evaluation Input Module (M1.3)**: Flexible single submission interface accepting Question, AI Response, optional Reference Answer, and optional Source Document.
- **Reference Knowledge Base (M1.4)**: Integrated RAG vector store powered by **ChromaDB** and **Sentence-Transformers**, seeded with public QA benchmarks (**TruthfulQA** and **SQuAD** from Hugging Face).
- **M2.1 — Relevance Judge Agent**: Evaluates response relevance on a 5-tier scale (`FULLY_RELEVANT`, `MOSTLY_RELEVANT`, `PARTIALLY_RELEVANT`, `UNRELATED`, `OFF_TOPIC_OR_REFUSAL`), checking intent coverage and handling non-committal refusals.
- **M2.2 — Accuracy Judge Agent**: Evaluates factual correctness on a 5-tier scale (`FULLY_ACCURATE`, `MOSTLY_ACCURATE`, `PARTIALLY_CORRECT`, `INCORRECT`, `CONTRADICTORY`), comparing claims against reference answers or RAG-retrieved chunks, extracting **supporting evidence** and **contradicting evidence**, and verifying numerical entities.
- **M2.3 — Hallucination Detection Agent**: Decomposes responses into atomic claims, cross-references against RAG source context, flags specific hallucinated sub-spans with violation category tags (`UNGROUNDED`, `CONTRADICTION`, `EXAGGERATION`, `FABRICATED_CITATION`), and assigns risk tiers (`LOW`, `MEDIUM`, `HIGH`).
- **M3.1 — Completeness Judge Agent**: Extracts prompt sub-questions and ground-truth key facts, identifies specific omissions, and categorizes completeness on a 4-tier scale (`FULLY_COMPLETE`, `MOSTLY_COMPLETE`, `PARTIALLY_COMPLETE`, `INCOMPLETE_OR_OMITTED`).
- **M3.2 — Verdict Agent & Executive Summary Synthesis**: Combines all 4 judge dimension scores using a weighted model (35% Hallucination, 25% Accuracy, 20% Relevance, 20% Completeness), applies critical failure overrides (severe ungrounded hallucination, off-topic refusal, factual contradiction), determines overall quality verdict (`PASS`, `NEEDS_IMPROVEMENT`, `FAIL`), and synthesizes an executive reasoning report.
- **M3.3 — Per-Dimension Interactive Dashboard**: Glassmorphic UI featuring weighted composite gauges, 4 agent dimension score meters, ground-truth evidence snippets, flagged claim cards, coverage/omissions analysis, and modal inspection views.
- **M3.4 — Batch Evaluation Module**: Upload CSV files containing question-answer pairs for automated batch evaluation, calculate batch aggregate statistics (Pass Rate %, Avg Composite Score, Hallucination Frequency Rate %), filter table rows, inspect row details in an overlay modal, and export results to downloadable CSV.

---

## 🏗️ System Architecture & Tech Stack

### Tech Stack
- **Backend API**: Python 3.10+, FastAPI, Pydantic v2, Uvicorn
- **Vector Database**: ChromaDB (Embedded, persistent local vector store)
- **Embeddings**: Sentence-Transformers (`all-MiniLM-L6-v2`, 384-dimensional dense vectors)
- **Datasets**: Hugging Face Datasets (`truthful_qa`, `squad`)
- **Frontend**: HTML5, Modern Vanilla CSS (Glassmorphism, Dark Mode), Asynchronous JS

### System Diagram

```
+-----------------------------------------------------------------------------------+
|                        Single Submission UI / Dashboard                           |
+-----------------------------------------------------------------------------------+
                                          │
                                   (HTTP POST /api/v1/evaluate)
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|                            FastAPI Backend / API Layer                            |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|                             Agent Orchestrator Pipeline                           |
+-----------------------------------------------------------------------------------+
         │                                                        │
  (If Context Missing)                                   (Parallel Dispatch)
         │                                                        │
         ▼                                                        ▼
+-----------------------+                        +----------------------------------+
| RAG Vector Store      |                        | Multi-Agent Evaluation Layer     |
| (ChromaDB + Embedder) |                        | • Relevance Judge Agent (M2.1)   |
| • TruthfulQA Benchmark| ───Retrieved Context──>| • Accuracy Judge Agent (M2.2)    |
| • SQuAD Benchmark     |                        | • Hallucination Agent (M2.3)     |
+-----------------------+                        | • Completeness Judge Agent       |
                                                 +----------------------------------+
                                                                  │
                                                                  ▼
                                                 +----------------------------------+
                                                 | Verdict Agent Synthesis          |
                                                 | • Composite Score (0-100)        |
                                                 | • Risk Tier (LOW/MED/HIGH)       |
                                                 | • Pass/Fail Verdict Determination|
                                                 | • Supporting Evidence & Claims   |
                                                 +----------------------------------+
```

---

## 🚀 Quick Start Guide

### 1. Installation
Clone the repository and install dependencies:
```bash
# Install Python dependencies
pip install -r requirements.txt
```

### 2. Run the Application
Start the FastAPI server:
```bash
python -m app.main
```
Or with Uvicorn directly:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Open the Interactive Dashboard
Open your web browser and navigate to:
👉 **`http://localhost:8000`**

Open API Swagger Documentation is available at:
👉 **`http://localhost:8000/docs`**

---

## 🧪 Running Automated Tests & Benchmark Validation

### 1. Milestone 2 Agent Consistency & Validation Suite
Run the Milestone 2 CLI validation tool:
```bash
python run_m2_validation.py
```
*Expected Output:*
```
================================================================================
 MILESTONE 2 AGENT VALIDATION SUMMARY REPORT
================================================================================
 Total Test Cases Evaluated : 6
 Execution Duration        : ~11 seconds
 Overall Benchmark Accuracy: 100.0%
 Hallucination Precision   : 100.0%
 Hallucination Recall      : 100.0%
 Hallucination F1-Score    : 100.0%
 Confusion Matrix Breakdown: TP=4, TN=2, FP=0, FN=0
================================================================================
```

### 2. Complete Unit Test Suite
Run unit tests with unittest or pytest:
```bash
python run_tests.py
# Or
pytest tests/
```

### Test Coverage Breakdown
- `tests/test_input_module.py`: Input schema validation, whitespace sanitization, edge cases.
- `tests/test_kb.py`: Text chunker, embedding generation, ChromaDB vector indexing, semantic retrieval.
- `tests/test_eval_agents.py`: Judge agents (Relevance, Accuracy, Hallucination, Completeness), Orchestrator execution, Verdict aggregation.
- `tests/test_benchmark_validation.py`: M2.4 benchmark validation suite evaluating TruthfulQA, SQuAD, and edge cases.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/evaluate` | Submit single evaluation request (`question`, `ai_response`, optional `reference_answer`, optional `source_document`). Returns full verdict report. |
| `GET` | `/api/v1/evaluations` | List recent evaluation submissions and verdicts. |
| `GET` | `/api/v1/evaluations/{id}` | Retrieve detailed evaluation report by UUID. |
| `POST` | `/api/v1/kb/search` | Execute semantic retrieval search against indexed Reference Knowledge Base. |
| `POST` | `/api/v1/kb/ingest` | Trigger benchmark dataset ingestion (`truthful_qa` or `squad`). |
| `GET` | `/api/v1/kb/stats` | Get vector store index stats and dataset chunk counts. |

---

## 📄 Documentation Artifacts

- 📋 [Agile Project Management & Sprint Lifecycle](docs/AGILE.md) (`Scrumban, Epics, Stories, DoD/DoR & Burndown`)
- 📕 [Research & Technical Understanding](docs/research_and_tech_stack.md) (`M1.1`)
- 📘 [System Architecture & Agent Specification](docs/architecture.md) (`M1.2`)
- 📗 [Milestone 2 Walkthrough & Validation Report](docs/walkthrough.md) (`M2.1 - M2.4`)
- 📙 [Milestone 3 Walkthrough & Verification Guide](docs/m3_walkthrough.md) (`M3.1 - M3.4`)
- 📊 [Milestone 4 Analytics Dashboard & PDF Exporter](docs/m4_dashboard_and_pdf.md) (`M4`)
- 📑 [Comprehensive Project Report & Technical Specification](docs/project_report.md)
- 🔬 [AI Systems Empirical Comparison Demo Report](docs/ai_systems_comparison_demo.md)
- 🌐 [Production Cloud Deployment Guide (Render, HF Spaces, Railway, Docker)](docs/DEPLOYMENT.md)

---

## 📜 License

This project is open-source software licensed under the [MIT License](LICENSE).
Copyright (c) 2026 VeriAI Contributors & Infosys Springboard Internship Team.

