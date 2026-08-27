import numpy as np
from typing import Optional, Dict, Any
from app.agents.base import BaseJudgeAgent
from app.models.schema import AgentDimensionScore
from app.kb.embedder import embedding_provider

class RelevanceJudgeAgent(BaseJudgeAgent):
    """
    Evaluates whether the AI response directly answers the user's question,
    measuring semantic alignment, intent satisfaction, and topic drift.
    """
    def __init__(self):
        super().__init__(name="Relevance Judge Agent", weight=0.20)

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
                reasoning="Missing question or response text for relevance evaluation.",
                details={"is_on_topic": False}
            )

        # 1. Compute cosine embedding similarity between question and response
        q_embed = np.array(embedding_provider.embed_query(question))
        r_embed = np.array(embedding_provider.embed_query(ai_response))
        
        sim = float(np.dot(q_embed, r_embed) / (np.linalg.norm(q_embed) * np.linalg.norm(r_embed) + 1e-8))
        sim = max(0.0, min(1.0, sim))

        # 2. Key Question Keyword Overlap Check
        q_words = set([w.lower().strip("?,.!") for w in question.split() if len(w) > 3])
        r_words = set([w.lower().strip("?,.!") for w in ai_response.split() if len(w) > 3])
        
        overlap_ratio = len(q_words.intersection(r_words)) / max(1, len(q_words)) if q_words else 0.5

        # 3. Composite Relevance Score Calculation (0 - 100)
        # Combine embedding similarity (70%) and keyword overlap (30%)
        raw_score = (sim * 70.0) + (overlap_ratio * 30.0)
        
        # Non-committal or generic refusals ("I don't know", "As an AI") check
        refusal_phrases = ["as an ai", "i don't know", "i cannot answer", "no information"]
        is_refusal = any(p in ai_response.lower() for p in refusal_phrases)
        if is_refusal:
            raw_score = min(raw_score, 45.0)

        final_score = round(max(0.0, min(100.0, raw_score)), 1)
        is_on_topic = final_score >= 50.0

        if final_score >= 85.0:
            reasoning = f"Excellent query-response relevance ({final_score}/100). The AI response directly addresses the question's core intent."
        elif final_score >= 60.0:
            reasoning = f"Moderate relevance ({final_score}/100). Response touches on key concepts but includes tangential or indirect information."
        else:
            reasoning = f"Low relevance ({final_score}/100). High topic drift or question-deafness detected; response fails to address the prompt."

        return AgentDimensionScore(
            score=final_score,
            reasoning=reasoning,
            details={
                "semantic_similarity": round(sim, 4),
                "keyword_overlap_ratio": round(overlap_ratio, 4),
                "is_on_topic": is_on_topic,
                "detected_refusal": is_refusal
            }
        )
