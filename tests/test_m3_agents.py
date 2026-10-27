import unittest
from app.models.schema import EvaluationInputRequest, AgentDimensionScore
from app.agents.completeness_judge import CompletenessJudgeAgent
from app.agents.verdict_agent import VerdictAgent

class TestM3Agents(unittest.TestCase):
    def setUp(self):
        self.completeness_agent = CompletenessJudgeAgent()
        self.verdict_agent = VerdictAgent()

    def test_completeness_fully_complete(self):
        question = "What is gravity and who discovered its mathematical formulation?"
        ai_response = "Gravity is a fundamental force of nature that attracts objects with mass towards each other. Isaac Newton discovered its mathematical formulation in 1687 with the law of universal gravitation."
        ref_answer = "Gravity attracts massive objects. Sir Isaac Newton formulated the law of universal gravitation."
        
        score = self.completeness_agent.evaluate(question, ai_response, ref_answer)
        self.assertGreaterEqual(score.score, 80.0)
        self.assertEqual(score.details["completeness_category"], "FULLY_COMPLETE")
        self.assertGreater(len(score.details["covered_aspects"]), 0)

    def test_completeness_partially_complete(self):
        question = "What are the causes of global warming and what are three ways to mitigate it?"
        ai_response = "Global warming is primarily caused by greenhouse gas emissions such as carbon dioxide and methane from human activities."
        
        score = self.completeness_agent.evaluate(question, ai_response)
        self.assertLess(score.score, 80.0)
        self.assertIn("mitigate", str(score.details.get("missing_aspects", [])).lower() + str(score.details.get("unanswered_subquestions", [])).lower())

    def test_completeness_substantially_incomplete(self):
        question = "Explain the theory of relativity, quantum mechanics, and string theory in detail with examples."
        ai_response = "It is physics."
        
        score = self.completeness_agent.evaluate(question, ai_response)
        self.assertLess(score.score, 45.0)
        self.assertEqual(score.details["completeness_category"], "INCOMPLETE_OR_OMITTED")

    def test_verdict_synthesis_pass(self):
        rel = AgentDimensionScore(score=95.0, reasoning="Fully relevant.")
        acc = AgentDimensionScore(score=90.0, reasoning="Fully accurate.")
        hal = AgentDimensionScore(score=95.0, reasoning="No hallucinations.")
        com = AgentDimensionScore(score=90.0, reasoning="Complete coverage.")

        verdict = self.verdict_agent.synthesize("Q", "A", rel, acc, hal, com)
        self.assertEqual(verdict.verdict, "PASS")
        self.assertEqual(verdict.hallucination_risk, "LOW")
        self.assertGreaterEqual(verdict.overall_score, 85.0)

    def test_verdict_synthesis_needs_improvement(self):
        rel = AgentDimensionScore(score=90.0, reasoning="Relevant.")
        acc = AgentDimensionScore(score=75.0, reasoning="Minor errors.")
        hal = AgentDimensionScore(score=70.0, reasoning="Minor ungrounded claim.")
        com = AgentDimensionScore(score=60.0, reasoning="Missing key detail.")

        verdict = self.verdict_agent.synthesize("Q", "A", rel, acc, hal, com)
        self.assertEqual(verdict.verdict, "NEEDS_IMPROVEMENT")
        self.assertEqual(verdict.hallucination_risk, "MEDIUM")

    def test_verdict_severe_hallucination_override_fail(self):
        rel = AgentDimensionScore(score=90.0, reasoning="Relevant.")
        acc = AgentDimensionScore(score=80.0, reasoning="Accurate.")
        hal = AgentDimensionScore(score=30.0, reasoning="Severe hallucination detected!")
        com = AgentDimensionScore(score=90.0, reasoning="Complete.")

        verdict = self.verdict_agent.synthesize("Q", "A", rel, acc, hal, com)
        self.assertEqual(verdict.verdict, "FAIL")
        self.assertEqual(verdict.hallucination_risk, "HIGH")
        self.assertIn("CRITICAL FAILURE", verdict.summary_feedback)

if __name__ == "__main__":
    unittest.main()
