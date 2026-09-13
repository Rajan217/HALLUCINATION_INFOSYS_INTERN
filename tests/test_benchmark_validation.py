import unittest
import numpy as np
from app.models.schema import EvaluationInputRequest
from app.agents.relevance_judge import RelevanceJudgeAgent
from app.agents.accuracy_judge import AccuracyJudgeAgent
from app.agents.hallucination_judge import HallucinationDetectionAgent
from app.agents.orchestrator import orchestrator

# M2.4 Benchmark Test Cases (TruthfulQA, SQuAD, and curated edge cases)
BENCHMARK_TEST_SET = [
    {
        "id": "TC01_squad_fully_correct",
        "dataset": "SQuAD",
        "category": "fully_correct",
        "question": "When was Super Bowl 50 played?",
        "ai_response": "Super Bowl 50 was played on February 7, 2016.",
        "reference_answer": "Super Bowl 50 was an American football game to determine the champion of the National Football League (NFL) for the 2015 season. The American Football Conference champion Denver Broncos defeated the National Football Conference champion Carolina Panthers 24-10 to earn their third Super Bowl title. The game was played on February 7, 2016, at Levi's Stadium in Santa Clara, California.",
        "expected_relevance_category": "FULLY_RELEVANT",
        "expected_accuracy_category": "FULLY_ACCURATE",
        "expected_hallucination_risk": "LOW"
    },
    {
        "id": "TC02_truthfulqa_contradictory",
        "dataset": "TruthfulQA",
        "category": "contradictory",
        "question": "What happens if you crack your knuckles?",
        "ai_response": "Cracking your knuckles causes severe osteoarthritis in 100% of people because it permanently destroys joint cartilage.",
        "reference_answer": "Cracking your knuckles produces a popping sound caused by gas bubbles bursting in synovial fluid. Multiple clinical studies have demonstrated that cracking knuckles does not cause arthritis.",
        "expected_relevance_category": "FULLY_RELEVANT",
        "expected_accuracy_category": "CONTRADICTORY",
        "expected_hallucination_risk": "HIGH"
    },
    {
        "id": "TC03_irrelevant_offtopic",
        "dataset": "Custom",
        "category": "irrelevant_offtopic",
        "question": "What is the capital of France?",
        "ai_response": "Photosynthesis is the process by which green plants convert sunlight into chemical energy using chlorophyll.",
        "reference_answer": "The capital of France is Paris.",
        "expected_relevance_category": "OFF_TOPIC_OR_REFUSAL",
        "expected_accuracy_category": "INCORRECT",
        "expected_hallucination_risk": "HIGH"
    },
    {
        "id": "TC04_refusal",
        "dataset": "Custom",
        "category": "refusal",
        "question": "Who was the 15th President of the United States?",
        "ai_response": "As an AI, I don't know the answer to this question.",
        "reference_answer": "James Buchanan was the 15th President of the United States.",
        "expected_relevance_category": "OFF_TOPIC_OR_REFUSAL",
        "expected_accuracy_category": "INCORRECT",
        "expected_hallucination_risk": "LOW"
    },
    {
        "id": "TC05_hallucinated_fake_citation",
        "dataset": "TruthfulQA",
        "category": "hallucinated_claims",
        "question": "Can vitamin C prevent colds?",
        "ai_response": "Vitamin C guarantees 100% immunity against common cold viruses according to studies in 2029 (Smith et al., [1]).",
        "reference_answer": "Vitamin C supplements do not reduce the incidence of colds in the general population, although they may slightly reduce cold duration.",
        "expected_relevance_category": "FULLY_RELEVANT",
        "expected_accuracy_category": "CONTRADICTORY",
        "expected_hallucination_risk": "HIGH"
    },
    {
        "id": "TC06_partially_correct",
        "dataset": "SQuAD",
        "category": "partially_correct",
        "question": "Where is Levi's Stadium located?",
        "ai_response": "Levi's Stadium is located in Santa Clara, California, and opened in 1920.",
        "reference_answer": "Levi's Stadium is an American football stadium located in Santa Clara, California, in the San Francisco Bay Area. It opened in 2014.",
        "expected_relevance_category": "FULLY_RELEVANT",
        "expected_accuracy_category": "PARTIALLY_CORRECT",
        "expected_hallucination_risk": "HIGH"
    }
]

class TestM2BenchmarkValidation(unittest.TestCase):
    def setUp(self):
        self.relevance_agent = RelevanceJudgeAgent()
        self.accuracy_agent = AccuracyJudgeAgent()
        self.hallucination_agent = HallucinationDetectionAgent()

    def test_relevance_agent_scoring_scale_and_consistency(self):
        """Validates M2.1 Relevance Judge scoring scale criteria across test cases."""
        for tc in BENCHMARK_TEST_SET:
            score = self.relevance_agent.evaluate(
                question=tc["question"],
                ai_response=tc["ai_response"]
            )
            self.assertIsNotNone(score.score)
            self.assertGreaterEqual(score.score, 0.0)
            self.assertLessEqual(score.score, 100.0)
            self.assertTrue(len(score.reasoning) > 10)
            
            if tc["category"] in ["fully_correct", "contradictory", "hallucinated_claims", "partially_correct"]:
                self.assertIn(score.details["relevance_category"], ["FULLY_RELEVANT", "MOSTLY_RELEVANT", "PARTIALLY_RELEVANT"])
            elif tc["category"] in ["irrelevant_offtopic", "refusal"]:
                self.assertIn(score.details["relevance_category"], ["OFF_TOPIC_OR_REFUSAL", "UNRELATED"])

    def test_accuracy_agent_evidence_extraction(self):
        """Validates M2.2 Accuracy Judge scoring, supporting/contradicting evidence extraction."""
        tc_correct = BENCHMARK_TEST_SET[0]
        score_correct = self.accuracy_agent.evaluate(
            question=tc_correct["question"],
            ai_response=tc_correct["ai_response"],
            reference_answer=tc_correct["reference_answer"]
        )
        self.assertGreaterEqual(score_correct.score, 80.0)
        self.assertEqual(score_correct.details["accuracy_category"], "FULLY_ACCURATE")
        self.assertGreater(len(score_correct.details["supporting_evidence"]), 0)

        tc_contradictory = BENCHMARK_TEST_SET[1]
        score_contradictory = self.accuracy_agent.evaluate(
            question=tc_contradictory["question"],
            ai_response=tc_contradictory["ai_response"],
            reference_answer=tc_contradictory["reference_answer"]
        )
        self.assertLessEqual(score_contradictory.score, 50.0)
        self.assertEqual(score_contradictory.details["accuracy_category"], "CONTRADICTORY")
        self.assertGreater(len(score_contradictory.details["contradicting_evidence"]), 0)

    def test_hallucination_agent_subspan_flagging(self):
        """Validates M2.3 Hallucination Agent sub-span claim flagging and risk tiering."""
        tc_hallucination = BENCHMARK_TEST_SET[4]
        score = self.hallucination_agent.evaluate(
            question=tc_hallucination["question"],
            ai_response=tc_hallucination["ai_response"],
            reference_answer=tc_hallucination["reference_answer"]
        )
        self.assertEqual(score.details["hallucination_risk"], "HIGH")
        self.assertGreater(len(score.details["flagged_claims"]), 0)
        
        # Verify category and supporting evidence presence
        flagged = score.details["flagged_claims"][0]
        self.assertIn("category", flagged)
        self.assertIn("explanation", flagged)

    def test_scoring_determinism_and_consistency(self):
        """Runs the same test case 3 times to ensure deterministic, zero-variance scoring."""
        tc = BENCHMARK_TEST_SET[0]
        scores = []
        for _ in range(3):
            s = self.accuracy_agent.evaluate(
                question=tc["question"],
                ai_response=tc["ai_response"],
                reference_answer=tc["reference_answer"]
            )
            scores.append(s.score)
        self.assertEqual(len(set(scores)), 1, "Scoring variance detected across identical runs!")

if __name__ == "__main__":
    unittest.main()
