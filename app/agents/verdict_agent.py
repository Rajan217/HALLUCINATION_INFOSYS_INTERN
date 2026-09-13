import uuid
from typing import List, Dict, Any, Optional
from app.models.schema import AgentDimensionScore, FlaggedClaim, EvaluationVerdict
from app.config import (
    WEIGHT_HALLUCINATION,
    WEIGHT_ACCURACY,
    WEIGHT_RELEVANCE,
    WEIGHT_COMPLETENESS,
    HALLUCINATION_FAIL_THRESHOLD,
    PASS_THRESHOLD,
    NEEDS_REVIEW_THRESHOLD
)

class VerdictAgent:
    """
    Synthesizes outputs from Relevance, Accuracy, Hallucination, and Completeness judge agents,
    computing the final weighted score, hallucination risk tier, and executive verdict report.
    """
    def synthesize(
        self,
        question: str,
        ai_response: str,
        relevance: AgentDimensionScore,
        accuracy: AgentDimensionScore,
        hallucination: AgentDimensionScore,
        completeness: AgentDimensionScore,
        reference_answer: Optional[str] = None,
        source_document: Optional[str] = None,
        retrieved_contexts: Optional[List[Dict[str, Any]]] = None
    ) -> EvaluationVerdict:
        
        # 1. Calculate Weighted Composite Score
        composite_score = (
            (hallucination.score * WEIGHT_HALLUCINATION) +
            (accuracy.score * WEIGHT_ACCURACY) +
            (relevance.score * WEIGHT_RELEVANCE) +
            (completeness.score * WEIGHT_COMPLETENESS)
        )
        composite_score = round(max(0.0, min(100.0, composite_score)), 1)

        # 2. Extract Flagged Claims from Hallucination Agent
        raw_flagged = hallucination.details.get("flagged_claims", [])
        flagged_claims = [
            FlaggedClaim(
                claim_text=fc["claim_text"],
                explanation=fc["explanation"],
                severity=fc.get("severity", "MEDIUM"),
                category=fc.get("category", "UNGROUNDED"),
                supporting_evidence=fc.get("supporting_evidence")
            ) for fc in raw_flagged
        ]

        # 3. Determine Hallucination Risk Tier
        if hallucination.score >= 85.0:
            risk_tier = "LOW"
        elif hallucination.score >= 60.0:
            risk_tier = "MEDIUM"
        else:
            risk_tier = "HIGH"

        # 4. Verdict Determination with Penalty Override
        if hallucination.score < HALLUCINATION_FAIL_THRESHOLD:
            verdict_status = "FAIL"
            penalty_applied = True
        elif composite_score >= PASS_THRESHOLD:
            verdict_status = "PASS"
            penalty_applied = False
        elif composite_score >= NEEDS_REVIEW_THRESHOLD:
            verdict_status = "NEEDS_REVIEW"
            penalty_applied = False
        else:
            verdict_status = "FAIL"
            penalty_applied = False

        # 5. Generate Executive Summary Feedback
        summary = (
            f"Overall Evaluation Verdict: [{verdict_status}] with Composite Score {composite_score}/100. "
            f"Hallucination Risk is rated {risk_tier} (Faithfulness Score: {hallucination.score}/100). "
            f"Breakdown -> Relevance: {relevance.score}/100, Accuracy: {accuracy.score}/100, Completeness: {completeness.score}/100."
        )
        if penalty_applied:
            summary += " CRITICAL WARNING: Verdict automatically forced to FAIL due to severe ungrounded hallucination score (<40.0)."
        elif flagged_claims:
            summary += f" Attention: {len(flagged_claims)} claim(s) were flagged as ungrounded or suspicious."

        return EvaluationVerdict(
            id=str(uuid.uuid4()),
            question=question,
            ai_response=ai_response,
            reference_answer=reference_answer,
            source_document=source_document,
            overall_score=composite_score,
            verdict=verdict_status,
            hallucination_risk=risk_tier,
            relevance=relevance,
            accuracy=accuracy,
            hallucination=hallucination,
            completeness=completeness,
            flagged_claims=flagged_claims,
            summary_feedback=summary,
            retrieved_contexts=retrieved_contexts or []
        )

# Singleton Instance
verdict_agent = VerdictAgent()
