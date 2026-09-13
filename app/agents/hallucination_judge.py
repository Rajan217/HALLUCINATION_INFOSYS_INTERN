import re
import numpy as np
from typing import Optional, List, Dict, Any
from app.agents.base import BaseJudgeAgent
from app.models.schema import AgentDimensionScore, FlaggedClaim
from app.kb.embedder import embedding_provider

class HallucinationDetectionAgent(BaseJudgeAgent):
    """
    M2.3 — Hallucination Detection Agent
    Identifies claims in an AI-generated response that are unsupported, fabricated, or contradicted
    by RAG-retrieved source content or reference documents. Flags specific hallucinated sub-spans with explanations.
    """
    def __init__(self):
        super().__init__(name="Hallucination Detection Agent", weight=0.35)

    def evaluate(
        self,
        question: str,
        ai_response: str,
        reference_answer: Optional[str] = None,
        source_document: Optional[str] = None
    ) -> AgentDimensionScore:
        context_text = (source_document or reference_answer or "").strip()

        # Check for refusal / non-committal response
        refusal_patterns = [r"as an ai", r"i don't know", r"i cannot answer", r"i am unable to", r"no information"]
        is_refusal = any(re.search(p, ai_response, re.IGNORECASE) for p in refusal_patterns) and len(ai_response.split()) < 25
        if is_refusal:
            return AgentDimensionScore(
                score=100.0,
                reasoning="Response declines to answer; no hallucinated or ungrounded factual claims were asserted.",
                details={
                    "hallucination_risk": "LOW",
                    "total_claims_analyzed": 0,
                    "supported_claims_count": 0,
                    "flagged_claims_count": 0,
                    "flagged_claims": []
                }
            )

        # If no reference context exists, perform self-consistency / heuristic risk check
        if not context_text:
            return self._evaluate_without_context(question, ai_response)

        # 1. Decompose response into granular sentence claims
        raw_claims = [c.strip() for c in re.split(r'[.!?]\s+|\n+', ai_response) if len(c.strip()) > 8]
        if not raw_claims:
            raw_claims = [ai_response.strip()]

        flagged_claims: List[FlaggedClaim] = []
        supported_count = 0
        
        # 2. Decompose reference context into sentence units
        context_sentences = [s.strip() for s in re.split(r'[.!?]\s+|\n+', context_text) if len(s.strip()) > 5]
        if not context_sentences:
            context_sentences = [context_text]

        context_sentence_embeds = [np.array(embedding_provider.embed_query(s)) for s in context_sentences]

        # 3. Detection Patterns
        fake_cite_pattern = re.compile(
            r'\(Smith et al\.|\[1\]|\[2\]|\[3\]|according to (?:a|the) 202\d study|Journal of \w+ 202\d|studies in 202\d\)',
            re.IGNORECASE
        )
        negation_words = {"not", "never", "no", "false", "disproven", "denies", "refuses", "without"}
        exaggeration_patterns = [
            r"100% of", r"in the year 202\d", r"permanently destroys", r"universally proven", r"guaranteed to"
        ]

        # 4. Cross-Reference Individual Claims against Source Context
        for claim in raw_claims:
            claim_embed = np.array(embedding_provider.embed_query(claim))
            
            sims = [
                float(np.dot(cs_emb, claim_embed) / (np.linalg.norm(cs_emb) * np.linalg.norm(claim_embed) + 1e-8))
                for cs_emb in context_sentence_embeds
            ]
            
            best_idx = int(np.argmax(sims)) if sims else 0
            best_sim = sims[best_idx] if sims else 0.0
            matched_sentence = context_sentences[best_idx] if context_sentences else ""

            has_fake_cite = bool(fake_cite_pattern.search(claim))
            has_exaggeration = any(re.search(p, claim, re.IGNORECASE) for p in exaggeration_patterns)
            
            context_has_neg = any(w in context_text.lower().split() for w in negation_words)
            claim_has_neg = any(w in claim.lower().split() for w in negation_words)
            negation_mismatch = (context_has_neg != claim_has_neg) and best_sim > 0.40

            claim_numbers = set(re.findall(r'\b\d+(?:\.\d+)?%?\b', claim))
            context_numbers = set(re.findall(r'\b\d+(?:\.\d+)?%?\b', context_text))
            unsupported_numbers = claim_numbers - context_numbers if context_numbers else set()

            # Claim is supported if semantic similarity >= 0.42 and no severe contradiction signatures
            if best_sim >= 0.42 and not has_fake_cite and not has_exaggeration and not negation_mismatch and len(unsupported_numbers) == 0:
                supported_count += 1
            else:
                # Classify claim violation category & severity
                if negation_mismatch:
                    category = "CONTRADICTION"
                    severity = "HIGH"
                    exp = f"Claim '{claim}' directly contradicts facts in source text ('{matched_sentence}')."
                elif has_fake_cite:
                    category = "FABRICATED_CITATION"
                    severity = "HIGH"
                    exp = f"Claim '{claim}' contains unverified or fabricated citation structures."
                elif has_exaggeration:
                    category = "EXAGGERATION"
                    severity = "MEDIUM"
                    exp = f"Claim '{claim}' contains extreme exaggeration not backed by source text."
                elif len(unsupported_numbers) > 0 and best_sim < 0.60:
                    category = "UNGROUNDED"
                    severity = "HIGH"
                    exp = f"Claim contains unsupported numerical values: {list(unsupported_numbers)}."
                else:
                    category = "UNGROUNDED"
                    severity = "HIGH" if best_sim < 0.25 else "MEDIUM"
                    exp = f"Claim '{claim}' lacks empirical support in retrieved source context (Similarity: {round(best_sim, 2)})."

                flagged_claims.append(FlaggedClaim(
                    claim_text=claim,
                    explanation=exp,
                    severity=severity,
                    category=category,
                    supporting_evidence=matched_sentence if best_sim > 0.30 else "No matching source sentence."
                ))

        total_claims = len(raw_claims)
        grounded_ratio = supported_count / max(1, total_claims)
        faithfulness_score = round(max(0.0, min(100.0, grounded_ratio * 100.0)), 1)

        # 5. Risk Tier Assignment
        if faithfulness_score >= 85.0 and len(flagged_claims) == 0:
            risk_tier = "LOW"
            reasoning = f"Low hallucination risk ({faithfulness_score}/100 faithfulness). All {supported_count}/{total_claims} claims are well-supported by reference context."
        elif faithfulness_score >= 60.0:
            risk_tier = "MEDIUM"
            reasoning = f"Medium hallucination risk ({faithfulness_score}/100 faithfulness). Detected {len(flagged_claims)} ungrounded or partially unsupported claim(s)."
        else:
            risk_tier = "HIGH"
            reasoning = f"High hallucination risk ({faithfulness_score}/100 faithfulness). Multiple claims lack empirical backing or contradict source context."

        return AgentDimensionScore(
            score=faithfulness_score,
            reasoning=reasoning,
            details={
                "hallucination_risk": risk_tier,
                "total_claims_analyzed": total_claims,
                "supported_claims_count": supported_count,
                "flagged_claims_count": len(flagged_claims),
                "flagged_claims": [fc.model_dump() for fc in flagged_claims]
            }
        )

    def _evaluate_without_context(self, question: str, ai_response: str) -> AgentDimensionScore:
        """Heuristic hallucination analysis when external source context is unavailable."""
        overconfident_patterns = [
            r"it is a universally proven fact that",
            r"100% of scientists agree that",
            r"in the year 2045",
            r"permanently destroys"
        ]
        has_overconfident = any(re.search(p, ai_response, re.IGNORECASE) for p in overconfident_patterns)

        base_score = 70.0 if not has_overconfident else 40.0
        risk_tier = "LOW" if base_score >= 70.0 else "HIGH"

        reasoning = (
            f"No external reference context provided. Assigned base faithfulness estimate of {base_score}/100."
            + (" Suspicious overconfident phrasing detected." if has_overconfident else "")
        )

        return AgentDimensionScore(
            score=base_score,
            reasoning=reasoning,
            details={
                "hallucination_risk": risk_tier,
                "total_claims_analyzed": 1,
                "supported_claims_count": 1 if base_score >= 70.0 else 0,
                "flagged_claims_count": 1 if has_overconfident else 0,
                "flagged_claims": [
                    FlaggedClaim(
                        claim_text=ai_response[:100],
                        explanation="Overconfident or suspicious unverified assertion.",
                        severity="HIGH",
                        category="EXAGGERATION",
                        supporting_evidence=None
                    ).model_dump()
                ] if has_overconfident else []
            }
        )

