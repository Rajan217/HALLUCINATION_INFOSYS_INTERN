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
    computing the weighted overall score, hallucination risk tier, and executive verdict summary.
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

        # 4. Verdict Determination with Penalty Overrides
        penalty_reason = None
        if hallucination.score < HALLUCINATION_FAIL_THRESHOLD:
            verdict_status = "FAIL"
            penalty_reason = f"Severe hallucination penalty triggered (Faithfulness score {hallucination.score} < threshold {HALLUCINATION_FAIL_THRESHOLD})."
        elif relevance.score < 30.0:
            verdict_status = "FAIL"
            penalty_reason = f"Critical query relevance failure (Relevance score {relevance.score} < 30.0)."
        elif accuracy.score < 30.0:
            verdict_status = "FAIL"
            penalty_reason = f"Critical factual accuracy failure (Accuracy score {accuracy.score} < 30.0)."
        elif composite_score >= PASS_THRESHOLD:
            verdict_status = "PASS"
        elif composite_score >= NEEDS_REVIEW_THRESHOLD:
            verdict_status = "NEEDS_IMPROVEMENT"
        else:
            verdict_status = "FAIL"

        # 5. Generate Executive Consolidated Reasoning Summary
        missing_aspects = completeness.details.get("missing_aspects", [])
        covered_aspects = completeness.details.get("covered_aspects", [])
        
        summary_parts = []
        summary_parts.append(
            f"Overall Quality Verdict: [{verdict_status}] with Weighted Composite Score {composite_score}/100. "
            f"Hallucination Risk: {risk_tier} (Faithfulness: {hallucination.score}/100, Accuracy: {accuracy.score}/100, Relevance: {relevance.score}/100, Completeness: {completeness.score}/100)."
        )

        if penalty_reason:
            summary_parts.append(f"⚠️ CRITICAL FAILURE: {penalty_reason}")

        strengths = []
        if relevance.score >= 85.0:
            strengths.append("High query intent alignment")
        if accuracy.score >= 85.0:
            strengths.append("Strong factual accuracy")
        if hallucination.score >= 85.0:
            strengths.append("High faithfulness to context")
        if completeness.score >= 85.0:
            strengths.append("Thorough completeness")

        if strengths:
            summary_parts.append(f"Major Strengths: {', '.join(strengths)}.")

        weaknesses = []
        if flagged_claims:
            weaknesses.append(f"{len(flagged_claims)} flagged hallucination claim(s)")
        if missing_aspects:
            weaknesses.append(f"{len(missing_aspects)} missing aspect(s)/omission(s)")
        if accuracy.score < 70.0 and "accuracy" not in [w.lower() for w in weaknesses]:
            weaknesses.append("Factual inconsistencies identified")

        if weaknesses:
            summary_parts.append(f"Areas Requiring Attention: {'; '.join(weaknesses)}.")

        if missing_aspects:
            summary_parts.append(f"Specific Omissions: {'; '.join(missing_aspects[:2])}.")

        consolidated_summary = " ".join(summary_parts)

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
            summary_feedback=consolidated_summary,
            retrieved_contexts=retrieved_contexts or []
        )

# Singleton Instance
verdict_agent = VerdictAgent()
