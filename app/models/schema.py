from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class EvaluationInputRequest(BaseModel):
    question: str = Field(..., description="The user question or prompt evaluated against", min_length=3)
    ai_response: str = Field(..., description="The AI-generated response being evaluated", min_length=1)
    reference_answer: Optional[str] = Field(None, description="Optional ground truth reference answer")
    source_document: Optional[str] = Field(None, description="Optional reference document / context material")

    @field_validator('question', 'ai_response')
    def strip_whitespace(cls, v: str) -> str:
        v_stripped = v.strip()
        if not v_stripped:
            raise ValueError("Field cannot be empty or whitespace only.")
        return v_stripped

class AgentDimensionScore(BaseModel):
    score: float = Field(..., ge=0.0, le=100.0, description="Dimension score between 0 and 100")
    reasoning: str = Field(..., description="Explanation supporting the assigned score")
    details: Dict[str, Any] = Field(default_factory=dict, description="Metadata or sub-metrics")

class FlaggedClaim(BaseModel):
    claim_text: str = Field(..., description="Sub-span or claim text extracted from AI response")
    explanation: str = Field(..., description="Why this claim is flagged as ungrounded or contradictory")
    severity: str = Field("MEDIUM", description="Severity level: LOW, MEDIUM, or HIGH")

class EvaluationVerdict(BaseModel):
    id: str = Field(..., description="Unique submission evaluation UUID")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    question: str
    ai_response: str
    reference_answer: Optional[str] = None
    source_document: Optional[str] = None
    overall_score: float = Field(..., ge=0.0, le=100.0)
    verdict: str = Field(..., description="PASS, NEEDS_REVIEW, or FAIL")
    hallucination_risk: str = Field(..., description="LOW, MEDIUM, or HIGH")
    relevance: AgentDimensionScore
    accuracy: AgentDimensionScore
    hallucination: AgentDimensionScore
    completeness: AgentDimensionScore
    flagged_claims: List[FlaggedClaim] = Field(default_factory=list)
    summary_feedback: str
    retrieved_contexts: List[Dict[str, Any]] = Field(default_factory=list)

class KBSearchRequest(BaseModel):
    query: str = Field(..., min_length=3, description="Search query string")
    top_k: int = Field(3, ge=1, le=20, description="Number of context chunks to retrieve")
    dataset: Optional[str] = Field(None, description="Optional dataset filter e.g. truthful_qa or squad")

class KBSearchResultItem(BaseModel):
    chunk_id: str
    text: str
    score: float
    dataset: str
    source_id: str
    metadata: Dict[str, Any]

class KBSearchResponse(BaseModel):
    query: str
    results: List[KBSearchResultItem]
    total_found: int

class BenchmarkIngestRequest(BaseModel):
    dataset_name: str = Field(..., description="truthful_qa or squad")
    max_samples: int = Field(50, ge=1, le=500, description="Number of samples to ingest")

class BenchmarkStatusResponse(BaseModel):
    total_chunks: int
    datasets_indexed: Dict[str, int]
    status: str
