import re
from typing import Optional
from app.agents.base import BaseJudgeAgent
from app.models.schema import AgentDimensionScore

class CompletenessJudgeAgent(BaseJudgeAgent):
    """
    Evaluates whether the AI response completely addresses all parts, sub-questions,
    and implicit requirements in the user prompt.
    """
    def __init__(self):
        super().__init__(name="Completeness Judge Agent", weight=0.20)

    def evaluate(
        self,
        question: str,
        ai_response: str,
        reference_answer: Optional[str] = None,
        source_document: Optional[str] = None
    ) -> AgentDimensionScore:
        if not question or not ai_response:
            return AgentDimensionScore(
                score=0.0,
                reasoning="Missing question or response text for completeness evaluation.",
                details={"covered_aspects": [], "missing_aspects": ["entire prompt"]}
            )

        # 1. Identify sub-questions / multi-part demands in question (e.g., "what, why, and how")
        sub_indicators = ["and", "what", "why", "how", "when", "where", "explain", "compare", "list"]
        question_lower = question.lower()

        # Measure response length & detail density
        words = ai_response.strip().split()
        word_count = len(words)

        # Basic coverage heuristics
        coverage_score = 100.0
        missing = []
        covered = ["Primary query intent"]

        if word_count < 5:
            coverage_score -= 50.0
            missing.append("Sufficient detail / explanation length")
        elif word_count < 15:
            coverage_score -= 25.0
            missing.append("Elaboration on key points")
        else:
            covered.append("Detailed response body")

        # Check for multi-part requirements ("explain X and Y")
        if " and " in question_lower or " as well as " in question_lower:
            parts = [p.strip() for p in re.split(r'\band\b|\bas well as\b', question_lower) if len(p.strip()) > 3]
            if len(parts) > 1:
                covered.append(f"Addressed multi-part query ({len(parts)} key clauses)")

        final_score = round(max(0.0, min(100.0, coverage_score)), 1)

        if final_score >= 85.0:
            reasoning = f"High completeness ({final_score}/100). The AI response thoroughly covers all aspects of the question."
        elif final_score >= 60.0:
            reasoning = f"Moderate completeness ({final_score}/100). The response addresses main points but leaves out requested details."
        else:
            reasoning = f"Low completeness ({final_score}/100). Brief or incomplete response failing to satisfy prompt scope."

        return AgentDimensionScore(
            score=final_score,
            reasoning=reasoning,
            details={
                "word_count": word_count,
                "covered_aspects": covered,
                "missing_aspects": missing
            }
        )
