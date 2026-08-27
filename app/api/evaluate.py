from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import json
import os
import logging
from app.models.schema import EvaluationInputRequest, EvaluationVerdict
from app.agents.orchestrator import orchestrator
from app.config import EVALUATIONS_FILE

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["Evaluation Input & Multi-Agent Layer"])

def _load_evaluations() -> List[dict]:
    if not os.path.exists(EVALUATIONS_FILE):
        return []
    try:
        with open(EVALUATIONS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading evaluations file: {e}")
        return []

def _save_evaluation(verdict: EvaluationVerdict):
    evals = _load_evaluations()
    evals.insert(0, verdict.model_dump())
    try:
        with open(EVALUATIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(evals, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving evaluation verdict: {e}")

@router.post("/evaluate", response_model=EvaluationVerdict, status_code=200)
async def submit_evaluation(input_data: EvaluationInputRequest):
    """
    Submits a single evaluation request containing a question, AI-generated response,
    optional reference answer, and optional source document.
    Executes the Multi-Agent Evaluation pipeline and returns structured verdict details.
    """
    try:
        verdict = orchestrator.run_evaluation(input_data)
        _save_evaluation(verdict)
        return verdict
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Evaluation pipeline error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal evaluation error: {str(e)}")

@router.get("/evaluations", response_model=List[dict])
async def list_evaluations(
    limit: int = Query(20, ge=1, le=100),
    verdict_filter: Optional[str] = Query(None, description="PASS, NEEDS_REVIEW, or FAIL")
):
    """Retrieves recent evaluation submissions and verdicts."""
    evals = _load_evaluations()
    if verdict_filter:
        evals = [e for e in evals if e.get("verdict", "").upper() == verdict_filter.upper()]
    return evals[:limit]

@router.get("/evaluations/{eval_id}", response_model=dict)
async def get_evaluation_by_id(eval_id: str):
    """Retrieves a specific evaluation report by UUID."""
    evals = _load_evaluations()
    for e in evals:
        if e.get("id") == eval_id:
            return e
    raise HTTPException(status_code=404, detail=f"Evaluation ID '{eval_id}' not found.")
