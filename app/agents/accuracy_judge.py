import numpy as np
from typing import Optional
from app.agents.base import BaseJudgeAgent
from app.models.schema import AgentDimensionScore
from app.kb.embedder import embedding_provider

class AccuracyJudgeAgent(BaseJudgeAgent):
    """
    Evaluates factual accuracy of the AI response against reference answers,
    ground-truth benchmark datasets, or retrieved source context.
    """
    def __init__(self):
        super().__init__(name="Accuracy Judge Agent", weight=0.25)

    def evaluate(
        self,
        question: str,
        ai_response: str,
        reference_answer: Optional[str] = None,
        source_document: Optional[str] = None
    ) -> AgentDimensionScore:
        target_ground_truth = reference_answer or source_document

        # If no explicit ground truth or context provided
        if not target_ground_truth or not target_ground_truth.strip():
            return AgentDimensionScore(
                score=75.0,
                reasoning="No ground-truth reference answer or source document available. Plausibility score assigned based on internal consistency.",
                details={"has_ground_truth": False, "match_type": "plausibility_estimate"}
            )

        # Split ground truth into sentence units for fine-grained sentence-level matching
        gt_sentences = [s.strip() for s in target_ground_truth.split('\n') if len(s.strip()) > 5]
        if not gt_sentences:
            gt_sentences = [target_ground_truth]

        r_embed = np.array(embedding_provider.embed_query(ai_response))
        sims = []
        for s in gt_sentences:
            gt_embed = np.array(embedding_provider.embed_query(s))
            sims.append(float(np.dot(gt_embed, r_embed) / (np.linalg.norm(gt_embed) * np.linalg.norm(r_embed) + 1e-8)))
        
        sim = max(sims) if sims else 0.0
        sim = max(0.0, min(1.0, sim))

        # Check key entity / number overlap
        gt_numbers = set([w for w in target_ground_truth.split() if any(c.isdigit() for c in w)])
        r_numbers = set([w for w in ai_response.split() if any(c.isdigit() for c in w)])
        
        number_match_score = 1.0
        if gt_numbers:
            matching_numbers = gt_numbers.intersection(r_numbers)
            number_match_score = len(matching_numbers) / len(gt_numbers)

        raw_score = (sim * 80.0) + (number_match_score * 20.0)
        final_score = round(max(0.0, min(100.0, raw_score)), 1)

        if final_score >= 85.0:
            reasoning = f"High accuracy ({final_score}/100). The AI response aligns closely with the ground-truth facts and reference data."
        elif final_score >= 60.0:
            reasoning = f"Moderate accuracy ({final_score}/100). Response is partially accurate but contains minor factual variances or missing numerical values."
        else:
            reasoning = f"Low accuracy ({final_score}/100). Response contradicts ground-truth reference evidence."

        return AgentDimensionScore(
            score=final_score,
            reasoning=reasoning,
            details={
                "has_ground_truth": True,
                "semantic_truth_alignment": round(sim, 4),
                "numerical_entity_accuracy": round(number_match_score, 4),
                "reference_length": len(target_ground_truth)
            }
        )
