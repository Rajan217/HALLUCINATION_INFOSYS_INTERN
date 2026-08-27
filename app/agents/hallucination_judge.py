import re
from typing import Optional, List, Dict, Any
from app.agents.base import BaseJudgeAgent
from app.models.schema import AgentDimensionScore, FlaggedClaim
from app.kb.embedder import embedding_provider
import numpy as np

class HallucinationDetectionAgent(BaseJudgeAgent):
    """
    Analyzes sentence/claim-level faithfulness against provided source text or reference context.
    Extracts individual assertions and identifies ungrounded, fabricated, or contradictory claims.
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
        context_text = source_document or reference_answer or ""
        
        # If no reference context exists, perform self-consistency / hallucination risk heuristics
        if not context_text.strip():
            return self._evaluate_without_context(question, ai_response)

        # 1. Decompose response into sentence claims
        claims = [c.strip() for c in re.split(r'[.!?]\s+', ai_response) if len(c.strip()) > 10]
        if not claims:
            claims = [ai_response.strip()]

        flagged_claims: List[FlaggedClaim] = []
        supported_count = 0
        # Split context into sentence units for fine-grained sentence-level matching
        context_sentences = [s.strip() for s in re.split(r'[.!?]\s+|\n+', context_text) if len(s.strip()) > 5]
        context_sentence_embeds = [np.array(embedding_provider.embed_query(s)) for s in context_sentences] if context_sentences else [np.array(embedding_provider.embed_query(context_text))]

        # Check for contradiction indicators (e.g., negation polarity mismatch) and exaggeration
        fake_citation_pattern = re.compile(r'\(Smith et al\.|\[1\]|\[2\]|according to studies in 2029\)', re.IGNORECASE)
        negation_terms = ["not", "never", "false", "no "]
        exaggeration_patterns = [r"100% of", r"in the year 202\d", r"permanently destroys", r"guaranteed to"]

        for claim in claims:
            claim_embed = np.array(embedding_provider.embed_query(claim))
            
            # Max similarity across reference context sentences
            sims = [
                float(np.dot(cs_emb, claim_embed) / (np.linalg.norm(cs_emb) * np.linalg.norm(claim_embed) + 1e-8))
                for cs_emb in context_sentence_embeds
            ]
            sim = max(sims) if sims else 0.0

            has_fake_cite = bool(fake_citation_pattern.search(claim))
            has_exaggeration = any(re.search(p, claim, re.IGNORECASE) for p in exaggeration_patterns)
            
            context_neg = any(t in context_text.lower() for t in negation_terms)
            claim_neg = any(t in claim.lower() for t in negation_terms)
            negation_mismatch = (context_neg != claim_neg) and ("cause" in claim.lower() or "is" in claim.lower())

            # Claim is supported if similarity to any context sentence is >= 0.40, no fake citations, no exaggeration, no negation mismatch
            if sim >= 0.40 and not has_fake_cite and not has_exaggeration and not negation_mismatch:
                supported_count += 1
            else:
                severity = "HIGH" if (negation_mismatch or has_fake_cite or has_exaggeration or sim < 0.25) else "MEDIUM"
                exp = f"Claim '{claim[:60]}...' is ungrounded or contradicts reference context (Similarity: {round(sim, 2)})."
                if negation_mismatch:
                    exp += " Negation/factuality contradiction detected."
                if has_exaggeration:
                    exp += " Extreme claim exaggeration detected."
                if has_fake_cite:
                    exp += " Contains suspicious/fabricated citation structure."
                
                flagged_claims.append(FlaggedClaim(
                    claim_text=claim,
                    explanation=exp,
                    severity=severity
                ))

        total_claims = len(claims)
        grounded_ratio = supported_count / max(1, total_claims)
        faithfulness_score = round(max(0.0, min(100.0, grounded_ratio * 100.0)), 1)

        # Assign risk tier
        if faithfulness_score >= 85.0:
            risk_tier = "LOW"
            reasoning = f"Low hallucination risk ({faithfulness_score}/100 faithfulness). {supported_count}/{total_claims} claims are well-supported by reference context."
        elif faithfulness_score >= 60.0:
            risk_tier = "MEDIUM"
            reasoning = f"Medium hallucination risk ({faithfulness_score}/100 faithfulness). Detected {len(flagged_claims)} potentially ungrounded claim(s)."
        else:
            risk_tier = "HIGH"
            reasoning = f"High hallucination risk ({faithfulness_score}/100 faithfulness). Multiple claims lack empirical backing in source text."

        return AgentDimensionScore(
            score=faithfulness_score,
            reasoning=reasoning,
            details={
                "hallucination_risk": risk_tier,
                "total_claims_analyzed": total_claims,
                "supported_claims_count": supported_count,
                "flagged_claims": [fc.model_dump() for fc in flagged_claims]
            }
        )

    def _evaluate_without_context(self, question: str, ai_response: str) -> AgentDimensionScore:
        """Heuristic hallucination analysis when external source context is unavailable."""
        # Detect hedge phrases or overconfident hallucinatory signatures
        overconfident_patterns = [
            r"it is a universally proven fact that",
            r"100% of scientists agree that",
            r"in the year 2045"
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
                "flagged_claims": []
            }
        )
