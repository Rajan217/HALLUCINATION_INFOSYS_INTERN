import re
from typing import Optional, List, Dict, Any
from app.agents.base import BaseJudgeAgent
from app.models.schema import AgentDimensionScore

class CompletenessJudgeAgent(BaseJudgeAgent):
    """
    Evaluates whether the AI response completely addresses all parts, sub-questions,
    and expected information contained in the prompt, reference answer, or source context.
    """
    def __init__(self):
        super().__init__(name="Completeness Judge Agent", weight=0.20)

    def _extract_requirements(self, question: str) -> List[str]:
        """
        Extracts sub-questions or distinct requirements from the prompt text.
        """
        reqs = []
        q_clean = question.strip()
        
        # 1. Check for numbered or bulleted sub-questions
        bullet_matches = re.findall(r'(?:^|\n)(?:\d+[\.\)]|[\-\*])\s*(.+)', q_clean)
        if len(bullet_matches) > 1:
            return [b.strip() for b in bullet_matches if len(b.strip()) > 3]

        # 2. Check for sentence-level sub-questions
        sentences = [s.strip() for s in re.split(r'[\?\!\n]+', q_clean) if len(s.strip()) > 5]
        if len(sentences) > 1:
            reqs.extend(sentences)
            return reqs

        # 3. Check for conjunction splits ("what is X and why does Y", "explain A as well as B")
        split_pattern = r'\b(?:and|as well as|along with|plus|versus|vs)\b'
        parts = [p.strip() for p in re.split(split_pattern, q_clean, flags=re.IGNORECASE) if len(p.strip()) > 5]
        if len(parts) > 1:
            reqs.extend(parts)
            return reqs

        # Fallback: Single primary requirement
        return [q_clean]

    def _extract_reference_points(self, text: Optional[str]) -> List[str]:
        """
        Extracts expected key concepts or facts from reference answer or source document.
        """
        if not text or not text.strip():
            return []
        
        # Split into key sentences or clauses
        sentences = [s.strip() for s in re.split(r'[\.\;\!\n]+', text.strip()) if len(s.strip()) > 10]
        return sentences[:5]  # Top 5 core reference points

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
                details={
                    "completeness_category": "INCOMPLETE_OR_OMITTED",
                    "covered_aspects": [],
                    "missing_aspects": ["Entire prompt"],
                    "unanswered_subquestions": ["Entire prompt"],
                    "coverage_percentage": 0.0
                }
            )

        ai_clean = ai_response.strip()
        words = ai_clean.split()
        word_count = len(words)
        ai_lower = ai_clean.lower()

        # 1. Identify requirements and reference expectations
        prompt_reqs = self._extract_requirements(question)
        ref_text = reference_answer or source_document
        ref_points = self._extract_reference_points(ref_text)

        covered_aspects = []
        missing_aspects = []
        unanswered_subquestions = []

        # 2. Evaluate Prompt Requirements Coverage
        prompt_scores = []
        for req in prompt_reqs:
            # Check key terms in req
            req_words = [w.lower() for w in re.findall(r'\b\w{4,}\b', req) if w.lower() not in {"what", "why", "how", "when", "where", "explain", "does", "have", "with", "from"}]
            if not req_words:
                req_words = [w.lower() for w in req.split() if len(w) > 2]

            matched = [w for w in req_words if w in ai_lower]
            match_ratio = len(matched) / max(1, len(req_words))

            if match_ratio >= 0.5 or any(w in ai_lower for w in req_words if len(w) > 6):
                covered_aspects.append(f"Addressed requirement: '{req}'")
                prompt_scores.append(1.0)
            elif match_ratio > 0.2:
                covered_aspects.append(f"Partially addressed requirement: '{req}'")
                prompt_scores.append(0.5)
                missing_aspects.append(f"Incomplete detail for: '{req}'")
            else:
                missing_aspects.append(f"Omitted requirement: '{req}'")
                unanswered_subquestions.append(req)
                prompt_scores.append(0.0)

        # 3. Evaluate Reference Answer / Context Points Coverage (if available)
        ref_scores = []
        if ref_points:
            for pt in ref_points:
                pt_words = [w.lower() for w in re.findall(r'\b\w{4,}\b', pt)]
                if not pt_words:
                    continue
                matched = [w for w in pt_words if w in ai_lower]
                ratio = len(matched) / max(1, len(pt_words))
                if ratio >= 0.4:
                    covered_aspects.append(f"Covered expected ground-truth point: '{pt[:60]}...'")
                    ref_scores.append(1.0)
                elif ratio > 0.15:
                    ref_scores.append(0.5)
                else:
                    missing_aspects.append(f"Omitted ground-truth detail: '{pt[:60]}...'")
                    ref_scores.append(0.0)

        # 4. Calculate Aggregate Coverage Score
        avg_prompt_score = (sum(prompt_scores) / max(1, len(prompt_scores))) * 100.0
        if ref_scores:
            avg_ref_score = (sum(ref_scores) / max(1, len(ref_scores))) * 100.0
            raw_score = (0.6 * avg_prompt_score) + (0.4 * avg_ref_score)
        else:
            raw_score = avg_prompt_score

        # Length / Detail Penalty
        if word_count < 5:
            raw_score = min(raw_score, 30.0)
            missing_aspects.append("Response is too brief to provide complete information.")
        elif word_count < 12 and len(prompt_reqs) > 1:
            raw_score = min(raw_score, 55.0)
            missing_aspects.append("Response lacks depth required for multi-part question.")

        final_score = round(max(0.0, min(100.0, raw_score)), 1)

        # 5. Categorize Completeness Scale
        if final_score >= 85.0:
            category = "FULLY_COMPLETE"
            reasoning = f"Fully Complete ({final_score}/100). The AI response thoroughly addresses all requirements and expected details."
        elif final_score >= 70.0:
            category = "MOSTLY_COMPLETE"
            reasoning = f"Mostly Complete ({final_score}/100). The response addresses primary question points, with minor secondary details omitted."
        elif final_score >= 45.0:
            category = "PARTIALLY_COMPLETE"
            reasoning = f"Partially Complete ({final_score}/100). The response answers part of the prompt but leaves out key required aspects."
        else:
            category = "INCOMPLETE_OR_OMITTED"
            reasoning = f"Incomplete / Omitted ({final_score}/100). The response fails to cover the question scope or omits critical required information."

        if missing_aspects and final_score < 100.0:
            reasoning += f" Omissions identified: {'; '.join(missing_aspects[:3])}."

        return AgentDimensionScore(
            score=final_score,
            reasoning=reasoning,
            details={
                "completeness_category": category,
                "coverage_percentage": final_score,
                "word_count": word_count,
                "prompt_requirements": prompt_reqs,
                "covered_aspects": list(dict.fromkeys(covered_aspects)),
                "missing_aspects": list(dict.fromkeys(missing_aspects)),
                "unanswered_subquestions": list(dict.fromkeys(unanswered_subquestions))
            }
        )

# Singleton Instance
completeness_judge = CompletenessJudgeAgent()
