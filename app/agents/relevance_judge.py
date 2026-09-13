import numpy as np
import re
from typing import Optional, Dict, Any
from app.agents.base import BaseJudgeAgent
from app.models.schema import AgentDimensionScore
from app.kb.embedder import embedding_provider

class RelevanceJudgeAgent(BaseJudgeAgent):
    """
    M2.1 — Relevance Judge Agent
    Evaluates whether the AI-generated response directly and appropriately answers the user's question.
    Implements a 5-tier scoring scale with explicit criteria, intent coverage check, and refusal detection.
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
                details={
                    "relevance_category": "OFF_TOPIC_OR_REFUSAL",
                    "is_on_topic": False,
                    "semantic_similarity": 0.0,
                    "keyword_overlap_ratio": 0.0,
                    "detected_refusal": False,
                    "intent_coverage_ratio": 0.0
                }
            )

        q_clean = question.strip()
        r_clean = ai_response.strip()

        # 1. Refusal & Non-committal Detection
        refusal_patterns = [
            r"as an ai", r"i don't know", r"i cannot answer", r"i am unable to",
            r"no information", r"i'm sorry, but", r"i do not have access", r"not mentioned in the context"
        ]
        is_refusal = any(re.search(p, r_clean, re.IGNORECASE) for p in refusal_patterns) and len(r_clean.split()) < 30

        # 2. Semantic Embedding Similarity
        q_embed = np.array(embedding_provider.embed_query(q_clean))
        r_embed = np.array(embedding_provider.embed_query(r_clean))
        
        sim = float(np.dot(q_embed, r_embed) / (np.linalg.norm(q_embed) * np.linalg.norm(r_embed) + 1e-8))
        sim = max(0.0, min(1.0, sim))

        # 3. Key Concept / Keyword Overlap
        stop_words = {"what", "when", "where", "which", "who", "whom", "whose", "why", "how", "this", "that", "these", "those", "is", "are", "was", "were", "been", "being", "have", "has", "had", "does", "did", "doing", "a", "an", "the", "and", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "upon", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once"}
        q_words = set([w.lower().strip("?,.!\":;") for w in q_clean.split() if w.lower().strip("?,.!\":;") not in stop_words and len(w) > 2])
        r_words = set([w.lower().strip("?,.!\":;") for w in r_clean.split() if w.lower().strip("?,.!\":;") not in stop_words and len(w) > 2])
        
        overlap_ratio = len(q_words.intersection(r_words)) / max(1, len(q_words)) if q_words else 0.5

        # 4. Intent Type Alignment (e.g. When -> expects digits/years, Where -> expects place indicators)
        q_lower = q_clean.lower()
        intent_match = True
        if any(w in q_lower for w in ["when", "year", "date", "how many", "how much"]):
            has_digits = any(c.isdigit() for c in r_clean)
            if not has_digits and len(r_words) < 15:
                intent_match = False

        intent_coverage = overlap_ratio * (1.0 if intent_match else 0.5)

        # 5. Calculate Composite Relevance Score (0 - 100)
        if is_refusal:
            raw_score = 15.0 if overlap_ratio > 0.3 else 5.0
        else:
            # 60% semantic similarity + 25% keyword overlap + 15% intent alignment
            raw_score = (sim * 60.0) + (overlap_ratio * 25.0) + (15.0 if intent_match else 5.0)

        final_score = round(max(0.0, min(100.0, raw_score)), 1)

        # 6. Categorize into 5-Tier Relevance Scale (M2.1 Criteria)
        if is_refusal or final_score < 10.0:
            category = "OFF_TOPIC_OR_REFUSAL"
            criteria_desc = "Response is off-topic, non-committal, or declines to answer the question."
        elif final_score < 40.0:
            category = "UNRELATED"
            criteria_desc = "Response mentions related concepts but fails to address the question's target intent."
        elif final_score < 70.0:
            category = "PARTIALLY_RELEVANT"
            criteria_desc = "Response touches on the question's topic but includes tangential info or omits core query dimensions."
        elif final_score < 90.0:
            category = "MOSTLY_RELEVANT"
            criteria_desc = "Response directly addresses the main question with high topic alignment."
        else:
            category = "FULLY_RELEVANT"
            criteria_desc = "Response directly, accurately, and comprehensively answers the question with zero topic drift."

        is_on_topic = final_score >= 50.0

        # Detailed Natural Language Reasoning
        reasoning = (
            f"Relevance Classification: {category} ({final_score}/100). {criteria_desc} "
            f"Semantic alignment score: {round(sim * 100, 1)}%, Keyword overlap: {round(overlap_ratio * 100, 1)}%."
        )
        if is_refusal:
            reasoning += " Refusal phrase detected in AI response."

        return AgentDimensionScore(
            score=final_score,
            reasoning=reasoning,
            details={
                "relevance_category": category,
                "is_on_topic": is_on_topic,
                "semantic_similarity": round(sim, 4),
                "keyword_overlap_ratio": round(overlap_ratio, 4),
                "intent_coverage_ratio": round(intent_coverage, 4),
                "detected_refusal": is_refusal
            }
        )

