# VeriAI — LLM Evaluation & Multi-Agent Hallucination Detection Platform

> **Milestone 1 & Milestone 2 Submission Complete**: LLM Evaluation Foundation, System Architecture, RAG Reference Knowledge Base (TruthfulQA & SQuAD), Evaluation Judge Agents (Relevance, Accuracy, Hallucination Detection), and Agent Consistency Validation Suite.

---

## 🌟 Overview

**VeriAI** is an enterprise-grade LLM evaluation, RAG benchmarking, and hallucination detection framework. It evaluates AI-generated responses against user prompts, reference ground truths, and benchmark knowledge bases using a specialized multi-agent architecture.

### Key Capabilities
- **Evaluation Input Module (M1.3)**: Flexible single submission interface accepting Question, AI Response, optional Reference Answer, and optional Source Document.
- **Reference Knowledge Base (M1.4)**: Integrated RAG vector store powered by **ChromaDB** and **Sentence-Transformers**, seeded with public QA benchmarks (**TruthfulQA** and **SQuAD** from Hugging Face).
- **M2.1 — Relevance Judge Agent**: Evaluates response relevance on a 5-tier scale (`FULLY_RELEVANT`, `MOSTLY_RELEVANT`, `PARTIALLY_RELEVANT`, `UNRELATED`, `OFF_TOPIC_OR_REFUSAL`), checking intent coverage and handling non-committal refusals.
- **M2.2 — Accuracy Judge Agent**: Evaluates factual correctness on a 5-tier scale (`FULLY_ACCURATE`, `MOSTLY_ACCURATE`, `PARTIALLY_CORRECT`, `INCORRECT`, `CONTRADICTORY`), comparing claims against reference answers or RAG-retrieved chunks, extracting **supporting evidence** and **contradicting evidence**, and verifying numerical entities.
- **M2.3 — Hallucination Detection Agent**: Decomposes responses into atomic claims, cross-references against RAG source context, flags specific hallucinated sub-spans with violation category tags (`UNGROUNDED`, `CONTRADICTION`, `EXAGGERATION`, `FABRICATED_CITATION`), and assigns risk tiers (`LOW`, `MEDIUM`, `HIGH`).
- **M2.4 — Agent Evaluation & Consistency Validation Suite**: Comprehensive benchmark validation script (`run_m2_validation.py`) and test suite (`tests/test_benchmark_validation.py`) evaluating TruthfulQA, SQuAD, and edge cases. Achieved **100% benchmark accuracy** and **100% hallucination precision/recall**.
- **Modern Interactive Web Dashboard**: Premium glassmorphic interface for real-time evaluation submission, live visual meter feedback, ground-truth supporting evidence snippets, claim category badges, RAG vector search exploration, and benchmark management.

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

- 📕 [Research & Technical Understanding](docs/research_and_tech_stack.md) (`M1.1`)
- 📘 [System Architecture & Agent Specification](docs/architecture.md) (`M1.2`)
