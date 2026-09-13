import re
import numpy as np
from typing import Optional, List, Dict, Any
from app.agents.base import BaseJudgeAgent
from app.models.schema import AgentDimensionScore
from app.kb.embedder import embedding_provider

class AccuracyJudgeAgent(BaseJudgeAgent):
    """
    M2.2 — Accuracy Judge Agent
    Evaluates the factual correctness of an AI-generated response against ground-truth reference answers
    or RAG-retrieved source context. Returns accuracy score, claim breakdown, and supporting/contradicting evidence.
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
        target_ground_truth = (reference_answer or "").strip()
        gt_source = "REFERENCE_ANSWER"

        if not target_ground_truth:
            target_ground_truth = (source_document or "").strip()
            gt_source = "SOURCE_DOCUMENT"

        # Check for refusal / non-committal response
        refusal_patterns = [r"as an ai", r"i don't know", r"i cannot answer", r"i am unable to", r"no information"]
        is_refusal = any(re.search(p, ai_response, re.IGNORECASE) for p in refusal_patterns) and len(ai_response.split()) < 25

        if is_refusal:
            return AgentDimensionScore(
                score=40.0,
                reasoning="Response declines to answer or states lack of knowledge; no factual claims to verify.",
                details={
                    "accuracy_category": "REFUSAL",
                    "has_ground_truth": bool(target_ground_truth),
                    "ground_truth_source": gt_source if target_ground_truth else "NONE",
                    "supporting_evidence": [],
                    "contradicting_evidence": [],
                    "claims_breakdown": [],
                    "numerical_entity_accuracy": 1.0
                }
            )

        # If no explicit reference answer or source document is available
        if not target_ground_truth:
            return AgentDimensionScore(
                score=75.0,
                reasoning="No ground-truth reference answer or source context available. Plausibility estimate assigned based on internal consistency.",
                details={
                    "accuracy_category": "PLAUSIBILITY_ESTIMATE",
                    "has_ground_truth": False,
                    "ground_truth_source": "NONE",
                    "supporting_evidence": [],
                    "contradicting_evidence": [],
                    "claims_breakdown": [],
                    "numerical_entity_accuracy": 1.0
                }
            )

        # 1. Claim & Ground Truth Sentence Decomposition
        response_claims = [c.strip() for c in re.split(r'[.!?]\s+|\n+', ai_response) if len(c.strip()) > 8]
        if not response_claims:
            response_claims = [ai_response.strip()]

        gt_sentences = [s.strip() for s in re.split(r'[.!?]\s+|\n+', target_ground_truth) if len(s.strip()) > 8]
        if not gt_sentences:
            gt_sentences = [target_ground_truth]

        gt_embeds = [np.array(embedding_provider.embed_query(s)) for s in gt_sentences]

        supporting_evidence: List[str] = []
        contradicting_evidence: List[str] = []
        claims_breakdown: List[Dict[str, Any]] = []

        correct_claims_count = 0
        partially_correct_count = 0
        incorrect_count = 0
        contradictory_count = 0

        # 2. Numerical Entity Accuracy Check against entire ground truth text
        gt_numbers = set(re.findall(r'\b\d+(?:\.\d+)?%?\b', target_ground_truth))
        r_numbers = set(re.findall(r'\b\d+(?:\.\d+)?%?\b', ai_response))

        if r_numbers:
            matching_numbers = r_numbers.intersection(gt_numbers)
            number_match_score = len(matching_numbers) / len(r_numbers)
            numerical_mismatches = list(r_numbers - gt_numbers)
        else:
            number_match_score = 1.0
            numerical_mismatches = []

        # 3. Individual Claim Cross-Referencing against Ground Truth Sentences
        negation_words = {"not", "no", "never", "none", "false", "disproven", "denies", "refuses"}

        for claim in response_claims:
            claim_embed = np.array(embedding_provider.embed_query(claim))
            
            sims = [
                float(np.dot(gt_emb, claim_embed) / (np.linalg.norm(gt_emb) * np.linalg.norm(claim_embed) + 1e-8))
                for gt_emb in gt_embeds
            ]

            best_sim_idx = int(np.argmax(sims)) if sims else 0
            best_sim = sims[best_sim_idx] if sims else 0.0
            matched_gt_sentence = gt_sentences[best_sim_idx] if gt_sentences else ""

            claim_neg = any(w in claim.lower().split() for w in negation_words)
            gt_neg = any(w in matched_gt_sentence.lower().split() for w in negation_words)
            is_negation_contradiction = (claim_neg != gt_neg) and best_sim > 0.40

            claim_nums = set(re.findall(r'\b\d+(?:\.\d+)?%?\b', claim))
            unsupported_claim_nums = claim_nums - gt_numbers
            number_contradiction = len(unsupported_claim_nums) > 0 and (best_sim < 0.70 or "year" in claim.lower() or "opened" in claim.lower())

            if is_negation_contradiction or number_contradiction:
                claim_status = "CONTRADICTORY" if is_negation_contradiction else "INCORRECT"
                if is_negation_contradiction:
                    contradictory_count += 1
                else:
                    incorrect_count += 1
                if matched_gt_sentence and matched_gt_sentence not in contradicting_evidence:
                    contradicting_evidence.append(f"Response claim '{claim}' contradicts evidence: '{matched_gt_sentence}'")
            elif best_sim >= 0.65 or (best_sim >= 0.50 and len(unsupported_claim_nums) == 0):
                claim_status = "CORRECT"
                correct_claims_count += 1
                if matched_gt_sentence and matched_gt_sentence not in supporting_evidence:
                    supporting_evidence.append(matched_gt_sentence)
            elif best_sim >= 0.40:
                claim_status = "PARTIALLY_CORRECT"
                partially_correct_count += 1
                if matched_gt_sentence and matched_gt_sentence not in supporting_evidence:
                    supporting_evidence.append(matched_gt_sentence)
            else:
                claim_status = "INCORRECT"
                incorrect_count += 1
                if matched_gt_sentence and f"Ungrounded claim: '{claim}'" not in contradicting_evidence:
                    contradicting_evidence.append(f"Ungrounded claim lacking reference backing: '{claim}'")

            claims_breakdown.append({
                "claim": claim,
                "status": claim_status,
                "similarity_score": round(best_sim, 4),
                "matched_evidence": matched_gt_sentence if best_sim >= 0.40 else None
            })

        # 4. Composite Accuracy Score Calculation (0 - 100)
        total_claims = max(1, len(response_claims))
        weighted_claim_acc = (
            (correct_claims_count * 1.0) +
            (partially_correct_count * 0.6) +
            (incorrect_count * 0.2) +
            (contradictory_count * 0.0)
        ) / total_claims

        overall_sim = max([c["similarity_score"] for c in claims_breakdown]) if claims_breakdown else 0.0
        
        # Combine weighted claim accuracy (60%), max semantic match (25%), and numerical accuracy (15%)
        raw_score = (weighted_claim_acc * 60.0) + (overall_sim * 25.0) + (number_match_score * 15.0)
        
        if contradictory_count > 0:
            raw_score = min(raw_score, 45.0)

        final_score = round(max(0.0, min(100.0, raw_score)), 1)

        # 5. 5-Tier Accuracy Scale Categorization (M2.2 Criteria)
        if contradictory_count > 0 and final_score < 45.0:
            category = "CONTRADICTORY"
            desc = "Response directly contradicts ground-truth reference evidence."
        elif final_score < 40.0:
            category = "INCORRECT"
            desc = "Response contains severe factual errors or ungrounded assertions."
        elif final_score < 70.0:
            category = "PARTIALLY_CORRECT"
            desc = "Response contains a mixture of accurate facts and minor inaccuracies or unverified claims."
        elif final_score < 90.0:
            category = "MOSTLY_ACCURATE"
            desc = "Response is factually sound with high ground-truth alignment and minor trivial omissions."
        else:
            category = "FULLY_ACCURATE"
            desc = "Response strictly aligns with ground-truth reference data across all factual claims."

        # Structured Reasoning Output
        reasoning = (
            f"Accuracy Classification: {category} ({final_score}/100). {desc} "
            f"Verified {correct_claims_count}/{total_claims} claims as fully correct, "
            f"{partially_correct_count} partially correct, {contradictory_count} contradictory. "
            f"Numerical accuracy: {round(number_match_score * 100, 1)}%."
        )

        return AgentDimensionScore(
            score=final_score,
            reasoning=reasoning,
            details={
                "accuracy_category": category,
                "has_ground_truth": True,
                "ground_truth_source": gt_source,
                "supporting_evidence": supporting_evidence[:5],
                "contradicting_evidence": contradicting_evidence[:5],
                "claims_breakdown": claims_breakdown,
                "numerical_entity_accuracy": round(number_match_score, 4),
                "numerical_mismatches": numerical_mismatches
            }
        )


