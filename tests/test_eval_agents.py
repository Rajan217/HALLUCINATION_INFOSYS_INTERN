import unittest
from app.models.schema import EvaluationInputRequest
from app.agents.orchestrator import orchestrator
from app.agents.relevance_judge import RelevanceJudgeAgent
from app.agents.hallucination_judge import HallucinationDetectionAgent

class TestEvaluationAgents(unittest.TestCase):
    def test_relevance_judge_high(self):
        agent = RelevanceJudgeAgent()
        score = agent.evaluate(
            question="What is the capital of France?",
            ai_response="The capital of France is Paris."
        )
        self.assertGreaterEqual(score.score, 80.0)
        self.assertTrue(score.details["is_on_topic"])

    def test_relevance_judge_refusal(self):
        agent = RelevanceJudgeAgent()
        score = agent.evaluate(
            question="What is the capital of France?",
            ai_response="As an AI, I don't know the answer to this question."
        )
        self.assertLessEqual(score.score, 50.0)
        self.assertTrue(score.details["detected_refusal"])

    def test_hallucination_detection_ungrounded_claims(self):
        agent = HallucinationDetectionAgent()
        score = agent.evaluate(
            question="What causes knuckle cracking sounds?",
            ai_response="Cracking knuckles causes severe osteoarthritis in 100% of people because it destroys cartilage permanently according to studies in 2029.",
            source_document="Cracking knuckles produces a popping sound caused by gas bubbles bursting in synovial fluid. Multiple clinical studies have demonstrated that cracking knuckles does not cause arthritis."
        )
        self.assertLess(score.score, 60.0)
        self.assertIn(score.details["hallucination_risk"], ["MEDIUM", "HIGH"])
        self.assertGreater(len(score.details["flagged_claims"]), 0)

    def test_orchestrator_end_to_end(self):
        req = EvaluationInputRequest(
            question="When was Super Bowl 50 played?",
            ai_response="Super Bowl 50 was played on February 7, 2016.",
            source_document="Super Bowl 50 was played on February 7, 2016, at Levi's Stadium."
        )
        verdict = orchestrator.run_evaluation(req)
        
        self.assertGreaterEqual(verdict.overall_score, 80.0)
        self.assertEqual(verdict.verdict, "PASS")
        self.assertEqual(verdict.hallucination_risk, "LOW")
        self.assertGreater(verdict.relevance.score, 70.0)
        self.assertGreater(verdict.accuracy.score, 70.0)

if __name__ == "__main__":
    unittest.main()
