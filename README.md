# VeriAI — LLM Evaluation & Multi-Agent Hallucination Detection Platform

> **Milestone 1 Submission**: LLM Evaluation Foundation, System Architecture, Evaluation Input Module, and Reference Knowledge Base (TruthfulQA & SQuAD Benchmarks).

---

## 🌟 Overview

**VeriAI** is an enterprise-grade LLM evaluation, RAG benchmarking, and hallucination detection framework. It evaluates AI-generated responses against user prompts, reference ground truths, and benchmark knowledge bases using a specialized multi-agent architecture.

### Key Capabilities
- **Evaluation Input Module (M1.3)**: Flexible single submission interface accepting Question, AI Response, optional Reference Answer, and optional Source Document.
- **Reference Knowledge Base (M1.4)**: Integrated RAG vector store powered by **ChromaDB** and **Sentence-Transformers**, seeded with public QA benchmarks (**TruthfulQA** and **SQuAD** from Hugging Face).
- **Multi-Agent Evaluation Layer (M1.2)**: Evaluates response quality across 4 key dimensions:
  1. 📍 **Relevance Judge Agent**: Semantic alignment & topic drift detection.
  2. 🎯 **Accuracy Judge Agent**: Ground-truth factual alignment & numerical entity verification.
  3. 🛡️ **Hallucination Detection Agent**: NLI claim extraction & span-level ungroundedness detection.
  4. 📝 **Completeness Judge Agent**: Scope & detail coverage assessment.
  5. ⚖️ **Verdict Agent**: Weighted composite scoring (0–100), risk tier assignment (LOW, MEDIUM, HIGH), and penalty overrides.
- **Modern Interactive Web Dashboard**: Premium glassmorphic interface for real-time evaluation submission, live visual meter feedback, RAG vector search exploration, and benchmark management.

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
| (ChromaDB + Embedder) |                        | • Relevance Judge Agent          |
| • TruthfulQA Benchmark| ───Retrieved Context──>| • Accuracy Judge Agent           |
| • SQuAD Benchmark     |                        | • Hallucination Detection Agent  |
+-----------------------+                        | • Completeness Judge Agent       |
                                                 +----------------------------------+
                                                                  │
                                                                  ▼
                                                 +----------------------------------+
                                                 | Verdict Agent Synthesis          |
                                                 | • Composite Score (0-100)        |
                                                 | • Risk Tier (LOW/MED/HIGH)       |
                                                 | • Pass/Fail Verdict Determination|
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

## 🧪 Running Automated Tests

Run the test suite using `pytest`:
```bash
pytest tests/
```

### Test Coverage Breakdown
- `tests/test_input_module.py`: Input schema validation, whitespace sanitization, edge cases.
- `tests/test_kb.py`: Text chunker, embedding generation, ChromaDB vector indexing, semantic retrieval.
- `tests/test_eval_agents.py`: Judge agents (Relevance, Accuracy, Hallucination, Completeness), Orchestrator execution, Verdict aggregation.

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
