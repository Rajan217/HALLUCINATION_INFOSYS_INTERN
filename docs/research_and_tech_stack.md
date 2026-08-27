# Milestone 1 Research & Technical Understanding (M1.1)

## Executive Summary
This document outlines the theoretical foundations, evaluation methodologies, dataset specifications, and technology stack choices for our **LLM Evaluation, RAG Benchmarking, and Multi-Agent Hallucination Detection Framework**.

---

## 1. LLM Evaluation Workflows & Automated Response Evaluation

Evaluating Large Language Model (LLM) responses is fundamentally different from traditional software testing because LLM outputs are probabilistic, non-deterministic, and context-dependent. Automated evaluation workflows establish structured pipelines to measure response quality across multiple quality axes without requiring full manual human review.

### Core Quality Dimensions
1. **Factuality & Faithfulness**: Does the response contain claims that are demonstrably true according to established ground truth or provided reference documents? Does it introduce fabricated information (hallucinations)?
2. **Relevance & Intent Alignment**: Does the response directly address the question or prompt asked by the user, without introducing off-topic tangents or unnecessary filler?
3. **Completeness & Coverage**: Are all sub-questions, constraints, and implicit requirements in the query fully addressed in the response?
4. **Coherence & Structure**: Is the response logically structured, grammatical, and clear?

---

## 2. Hallucination Detection & Taxonomy

Hallucination in LLMs occurs when a model generates content that is ungrounded in facts or inconsistent with provided context.

### Hallucination Types
* **Intrinsic Hallucination**: The generated output directly contradicts the source text or ground truth (e.g., claiming "Paris is in Germany" when the context states "Paris is in France").
* **Extrinsic Hallucination**: The generated output includes statements that cannot be verified or falsified from the provided source text (e.g., introducing external facts or unsupported claims not mentioned in the context).
* **Question-Deafness / Relevance Drift**: The response generates plausible-sounding facts, but answers a completely different question than the one asked.

### Detection Approaches
1. **Natural Language Inference (NLI)**: Decomposing the response into atomic propositions/claims and running Premise-Hypothesis entailment checking (`Entailment`, `Neutral`, `Contradiction`) against the reference context.
2. **N-gram and Semantic Similarity**: Comparing textual embeddings of generated responses against ground truth reference answers using cosine distance, BLEU, ROUGE-L, and BERTScore.
3. **Self-Consistency & Multi-Prompt Verification**: Sampling multiple responses or evaluating claim consistency across multiple prompt variations.

---

## 3. RAG Architecture & Vector Search Dynamics

Retrieval-Augmented Generation (RAG) grounds LLM outputs by conditioning generation on external knowledge retrieved from a reference database.

```
+------------------+      +-------------------+      +----------------------+
| Submitted Query  | ---> | Embedding Model   | ---> | Vector DB Retrieval  |
+------------------+      +-------------------+      +----------------------+
                                                               |
                                                               v
+------------------+      +-------------------+      +----------------------+
| LLM Generator    | <--- | Augment Prompt w/ | <--- | Top-K Context Chunks |
| / AI Response    |      | Retrieved Context |      +----------------------+
+------------------+      +-------------------+
```

### Retrieval & Indexing Pipeline
1. **Document Standardization & Cleaning**: Removing noise, normalizing text encodings, stripping invalid characters.
2. **Chunking Strategies**:
   - *Fixed-Size Character/Token Chunking*: Splitting text into chunks of N characters (e.g., 500 characters) with overlap (e.g., 50 characters) to prevent context fragmentation across chunk boundaries.
   - *Semantic / Sentence Boundary Chunking*: Splitting at natural sentence delimiters (`.`, `\n`) while maintaining maximum token budgets.
3. **Embeddings & Vector Indexing**: Mapping chunks into dense vector spaces using encoder models (e.g., `all-MiniLM-L6-v2`) where semantically similar texts cluster together.
4. **Similarity Retrieval**: Computing cosine similarity or inner product distance between query vector $v_q$ and chunk vectors $v_c$:
   $$\text{Cosine Similarity}(v_q, v_c) = \frac{v_q \cdot v_c}{\|v_q\| \|v_c\|}$$

---

## 4. LLM-as-a-Judge & Existing Evaluation Frameworks

### Framework Comparison: RAGAS vs. TruLens vs. Our Multi-Agent Framework

| Evaluation Dimension | RAGAS (Retrieval Augmented Generation Assessment) | TruLens (RAG Triad) | Our Multi-Agent Framework |
| :--- | :--- | :--- | :--- |
| **Faithfulness / Groundedness** | Measures claim overlap between generated response & context | Measures percentage of response sentences supported by retrieved context | **Hallucination Detection Agent**: NLI claim extraction & span-level ungroundedness flagging |
| **Answer Relevance** | Measures semantic embedding distance between generated answer & generated synthetic question | Measures query-to-answer semantic relevance using feedback functions | **Relevance Judge Agent**: Intent matching, topic drift detection, & semantic alignment |
| **Context Precision & Recall** | Evaluates retrieval rank quality against reference answers | Evaluates context-to-query relevance (Context Relevance) | **Accuracy & Knowledge Base Agent**: Semantic top-K retrieval scoring against TruthfulQA/SQuAD |
| **Completeness & Coverage** | Indirectly covered via Aspect Critiques | Not explicitly scored as a primary triad dimension | **Completeness Judge Agent**: Sub-question parsing and aspect coverage scoring |
| **Verdict Synthesis** | Harmonic mean / simple average | Independent triad meters | **Verdict Agent**: Weighted composite scoring, risk tier assignment (Low/Medium/High), & actionable feedback |

---

## 5. Benchmark QA Datasets Analysis

### TruthfulQA
- **Source**: Hugging Face `truthful_qa` (Generation & Multiple Choice splits).
- **Target Axis**: Designed specifically to test whether LLMs mimic human falsehoods and conspiracy theories.
- **Key Fields**: `question`, `best_answer`, `correct_answers`, `incorrect_answers`, `category`.
- **Application in KB**: Used to seed ground-truth reference QA pairs for evaluating AI response truthfulness and resistance to common misconceptions.

### SQuAD (Stanford Question Answering Dataset v1.1 / v2.0)
- **Source**: Hugging Face `squad`.
- **Target Axis**: Reading comprehension and context-bound factual retrieval.
- **Key Fields**: `id`, `title`, `context`, `question`, `answers` (`text`, `answer_start`).
- **Application in KB**: Used to populate dense reference source documents and context chunks to test RAG retrieval precision and context-bound hallucination detection.

---

## 6. Selected Technology Stack Rationale

1. **Python 3.10+ & FastAPI**: High-performance asynchronous API framework providing automatic OpenAPI schema generation, fast Pydantic v2 data validation, and native async support.
2. **ChromaDB**: Lightweight, embedded, open-source vector store operating locally without complex external daemon configuration. Ideal for fast persistent vector indexing of TruthfulQA and SQuAD.
3. **Sentence-Transformers (`all-MiniLM-L6-v2`)**: Fast, lightweight 384-dimensional embedding model optimized for sentence similarity and dense semantic retrieval.
4. **Hugging Face `datasets`**: Official library to fetch, parse, clean, and standardize benchmark datasets.
5. **Modern Vanilla HTML5/CSS3/JS Dashboard**: Responsive glassmorphic frontend UI serving as a single submission interface, live evaluation viewer, vector search explorer, and benchmark manager.
