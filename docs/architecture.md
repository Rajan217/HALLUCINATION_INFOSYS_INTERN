# Milestone 1 System Architecture & Multi-Agent Specification (M1.2)

## 1. System Architecture Overview

```mermaid
graph TD
    subgraph UI ["Evaluation Input / User Interface"]
        UI_Sub["Single Evaluation Submission Form"]
        UI_Dash["Results & Analytics Dashboard"]
        UI_KB["Knowledge Base Retrieval Explorer"]
    end

    subgraph API ["Backend / API Layer (FastAPI)"]
        API_Eval["Evaluation Endpoint (/api/v1/evaluate)"]
        API_KB["KB Search & Stats Endpoint (/api/v1/kb/*)"]
        API_Bench["Benchmark Ingestion Endpoint (/api/v1/benchmark/*)"]
    end

    subgraph Store ["Input & Results Persistence"]
        DB_Eval[("Evaluation Store (SQLite/JSON)")]
    end

    subgraph KB ["Reference Knowledge Base (RAG)"]
        Ingest["Dataset Ingestion (TruthfulQA / SQuAD)"]
        Chunker["Data Cleaning & Chunking Pipeline"]
        Embedder["Embedding Generation (all-MiniLM-L6-v2)"]
        VectorDB[("ChromaDB Vector Database")]
        RAG_Pipe["RAG Retrieval Pipeline"]
    end

    subgraph Agents ["AI Evaluation Agent Layer"]
        Orchestrator["Agent Orchestrator"]
        RelevanceAgent["Relevance Judge Agent"]
        AccuracyAgent["Accuracy Judge Agent"]
        HallucinationAgent["Hallucination Detection Agent"]
        CompletenessAgent["Completeness Judge Agent"]
        VerdictAgent["Verdict Agent"]
    end

    UI_Sub -->|HTTP POST| API_Eval
    UI_KB -->|HTTP POST/GET| API_KB
    API_Eval --> Store
    API_Eval --> Orchestrator
    Ingest --> Chunker --> Embedder --> VectorDB
    Orchestrator --> RAG_Pipe
    RAG_Pipe --> VectorDB
    VectorDB --> RAG_Pipe
    RAG_Pipe -->|Retrieved Evidence Context| Orchestrator
    Orchestrator --> RelevanceAgent
    Orchestrator --> AccuracyAgent
    Orchestrator --> HallucinationAgent
    Orchestrator --> CompletenessAgent
    RelevanceAgent -->|Relevance Score| VerdictAgent
    AccuracyAgent -->|Accuracy Score| VerdictAgent
    HallucinationAgent -->|Hallucination Score & Flags| VerdictAgent
    CompletenessAgent -->|Completeness Score| VerdictAgent
    VerdictAgent -->|Final Evaluation Report| API_Eval
    API_Eval -->|JSON Response| UI_Dash
```

---

## 2. Multi-Agent Layer Responsibilities

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Client API
    participant Orch as Agent Orchestrator
    participant KB as RAG Vector Store
    participant Rel as Relevance Judge Agent
    participant Acc as Accuracy Judge Agent
    participant Hal as Hallucination Detection Agent
    participant Comp as Completeness Judge Agent
    participant Ver as Verdict Agent

    User->>Orch: Submit (Question, Response, Reference?, SourceDoc?)
    alt Source Doc or Reference missing
        Orch->>KB: Semantic Query Search (Question)
        KB-->>Orch: Top-K Context Chunks & Metadata
    end

    par Parallel Evaluation Phase
        Orch->>Rel: Evaluate (Question, Response)
        Orch->>Acc: Evaluate (Question, Response, Reference/Context)
        Orch->>Hal: Evaluate (Response, Reference/Context)
        Orch->>Comp: Evaluate (Question, Response)
    end

    Rel-->>Orch: Relevance Score (0-100), Alignment Reasoning
    Acc-->>Orch: Accuracy Score (0-100), Factual Overlap
    Hal-->>Orch: Faithfulness Score (0-100), Ungrounded Claims / Spans
    Comp-->>Orch: Completeness Score (0-100), Coverage Ratio

    Orch->>Ver: Aggregate Scores (Rel, Acc, Hal, Comp)
    Ver->>Ver: Compute Weighted Composite Score & Risk Tier
    Ver-->>Orch: Final Evaluation Verdict & Synthesis
    Orch-->>User: Structured Evaluation Results Payload
```

### Agent Detailed Specifications

#### 1. Agent Orchestrator
- **Responsibility**: Manages state, pipeline routing, optional RAG context retrieval triggering, parallel dispatch to judge agents, and passing outputs to the Verdict Agent.
- **Inputs**: `question`, `ai_response`, `reference_answer` (optional), `source_document` (optional).
- **Behavior**: If reference answer or source document are absent, invokes RAG retrieval on the Reference Knowledge Base to supply context.

#### 2. Relevance Judge Agent
- **Responsibility**: Evaluates query-response intent alignment, semantic closeness, and checks for topic drift or question-deafness.
- **Output**: `score` (0–100), `explanation`, `question_intent`, `is_on_topic` (boolean).

#### 3. Accuracy Judge Agent
- **Responsibility**: Evaluates factual correctness against ground-truth reference answers or retrieved benchmark context.
- **Output**: `score` (0–100), `explanation`, `matched_facts`, `contradicted_facts`.

#### 4. Hallucination Detection Agent
- **Responsibility**: Analyzes statement-level faithfulness and identifies ungrounded assertions, entity mismatches, or fabricated details unsupported by source text or retrieved context.
- **Output**: `faithfulness_score` (0–100), `hallucination_risk` ("Low", "Medium", "High"), `flagged_claims` (list of text spans with ungrounded explanations).

#### 5. Completeness Judge Agent
- **Responsibility**: Evaluates whether all key aspects, sub-questions, and implicit prompt requirements are answered.
- **Output**: `score` (0–100), `explanation`, `covered_aspects`, `missing_aspects`.

#### 6. Verdict Agent
- **Responsibility**: Combines all four agent outputs into a unified composite evaluation verdict, determines overall status (`PASS`, `NEEDS_REVIEW`, `FAIL`), calculates overall score, and generates human-readable executive feedback.

---

## 3. Scoring Methodology & Formulas

### Metric Weighting System
The overall composite score $S_{\text{overall}} \in [0, 100]$ is computed as a weighted combination of the individual agent dimension scores:

$$S_{\text{overall}} = w_r \cdot S_{\text{relevance}} + w_a \cdot S_{\text{accuracy}} + w_h \cdot S_{\text{hallucination}} + w_c \cdot S_{\text{completeness}}$$

Default Weights:
- $w_h$ (**Hallucination / Faithfulness**): `0.35` (35%)
- $w_a$ (**Accuracy**): `0.25` (25%)
- $w_r$ (**Relevance**): `0.20` (20%)
- $w_c$ (**Completeness**): `0.20` (20%)

### Verdict Classification & Thresholds

| Overall Score Range | Hallucination Risk | Final Verdict | Action Recommendation |
| :--- | :--- | :--- | :--- |
| **85.0 – 100.0** | LOW | `PASS` | Safe for deployment; high accuracy & faithfulness. |
| **60.0 – 84.9** | MEDIUM | `NEEDS_REVIEW` | Minor gaps or ungrounded claims; human review suggested. |
| **0.0 – 59.9** | HIGH | `FAIL` | Significant hallucination or irrelevance; reject response. |

> **Special Penalty Override**: If the Hallucination score drops below `40.0` (severe hallucination detected), the final verdict is automatically forced to `FAIL` regardless of high relevance or completeness scores.

---

## 4. End-to-End Data Flow Architecture

```
[ User Input Submission ]
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Input Processing & Validation Module                  │
│ • Validate required fields (question, ai_response)      │
│ • Sanitize input strings                               │
│ • Generate unique submission ID                        │
└────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Context Resolution (RAG Pipeline)                       │
│ • Check if user provided source_document or reference  │
│ • If absent: Embed question -> Query ChromaDB          │
│ • Retrieve Top-K benchmark context chunks & metadata    │
└────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Multi-Agent Evaluation Layer                           │
│ • Dispatch to Relevance, Accuracy, Hallucination,      │
│   and Completeness Judge Agents                        │
│ • Collect dimension sub-scores & reasoning             │
└────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Verdict Synthesis & Score Aggregation                  │
│ • Calculate weighted composite score                   │
│ • Assign Risk Tier (LOW / MEDIUM / HIGH)              │
│ • Apply penalty overrides                              │
│ • Generate executive summary feedback                 │
└────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Result Persistence & Response Delivery                 │
│ • Persist evaluation snapshot to SQLite/JSON database │
│ • Return structured JSON payload to client UI          │
└────────────────────────────────────────────────────────┘
```
