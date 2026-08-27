import logging
from typing import Optional, Dict, Any, List
from app.models.schema import EvaluationInputRequest, EvaluationVerdict
from app.agents.relevance_judge import RelevanceJudgeAgent
from app.agents.accuracy_judge import AccuracyJudgeAgent
from app.agents.hallucination_judge import HallucinationDetectionAgent
from app.agents.completeness_judge import CompletenessJudgeAgent
from app.agents.verdict_agent import verdict_agent
from app.kb.vector_store import vector_store

logger = logging.getLogger(__name__)

class AgentOrchestrator:
    """
    Coordinates the multi-agent evaluation workflow: RAG context resolution,
    parallel agent dispatch, score aggregation, and verdict generation.
    """
    def __init__(self):
        self.relevance_agent = RelevanceJudgeAgent()
        self.accuracy_agent = AccuracyJudgeAgent()
        self.hallucination_agent = HallucinationDetectionAgent()
        self.completeness_agent = CompletenessJudgeAgent()

    def run_evaluation(self, input_req: EvaluationInputRequest) -> EvaluationVerdict:
        question = input_req.question
        ai_response = input_req.ai_response
        reference_answer = input_req.reference_answer
        source_document = input_req.source_document
        retrieved_contexts: List[Dict[str, Any]] = []

        logger.info(f"Orchestrating evaluation for question: '{question[:40]}...'")

        # 1. RAG Context Resolution: If no explicit source doc or reference answer is provided, query KB
        def clean_ref(txt: Optional[str]) -> str:
            if not txt:
                return ""
            s = txt.strip()
            # If string contains fewer than 2 alphanumeric chars (e.g. '.', '-', 'n/a'), treat as empty
            if len([c for c in s if c.isalnum()]) < 2:
                return ""
            return s

        effective_context = clean_ref(source_document)
        effective_reference = clean_ref(reference_answer)

        if not effective_context and not effective_reference:
            logger.info("No valid explicit reference or source doc provided. Invoking RAG vector retrieval...")
            search_results = vector_store.search(query=question, top_k=2)
            if search_results:
                retrieved_contexts = search_results
                # Combine top retrieved texts into effective source context
                effective_context = "\n---\n".join([r["text"] for r in search_results])
                if not effective_reference and search_results[0].get("metadata", {}).get("answer"):
                    effective_reference = search_results[0]["metadata"]["answer"]
                logger.info(f"Retrieved {len(search_results)} grounded context chunks from vector DB.")

        # 2. Dispatch to Judge Agents
        relevance_score = self.relevance_agent.evaluate(
            question=question,
            ai_response=ai_response,
            reference_answer=effective_reference,
            source_document=effective_context
        )

        accuracy_score = self.accuracy_agent.evaluate(
            question=question,
            ai_response=ai_response,
            reference_answer=effective_reference,
            source_document=effective_context
        )

        hallucination_score = self.hallucination_agent.evaluate(
            question=question,
            ai_response=ai_response,
            reference_answer=effective_reference,
            source_document=effective_context
        )

        completeness_score = self.completeness_agent.evaluate(
            question=question,
            ai_response=ai_response,
            reference_answer=effective_reference,
            source_document=effective_context
        )

        # 3. Verdict Synthesis & Final Report Generation
        verdict = verdict_agent.synthesize(
            question=question,
            ai_response=ai_response,
            relevance=relevance_score,
            accuracy=accuracy_score,
            hallucination=hallucination_score,
            completeness=completeness_score,
            reference_answer=reference_answer,
            source_document=source_document,
            retrieved_contexts=retrieved_contexts
        )

        return verdict

# Singleton Instance
orchestrator = AgentOrchestrator()
