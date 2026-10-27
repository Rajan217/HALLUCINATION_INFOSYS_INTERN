import unittest
import io
import csv
from app.api.batch_evaluate import parse_csv_file
from app.models.schema import EvaluationInputRequest
from app.agents.orchestrator import orchestrator

class TestBatchEvaluation(unittest.TestCase):
    def test_parse_csv_file_valid(self):
        csv_data = (
            "Question,AI_Response,Reference_Answer\n"
            "What is the capital of France?,The capital of France is Paris.,Paris is the capital.\n"
            "Does cracking knuckles cause arthritis?,Cracking knuckles causes severe joint arthritis.,Cracking knuckles releases gas bubbles and does not cause arthritis.\n"
        ).encode("utf-8")

        records = parse_csv_file(csv_data)
        self.assertEqual(len(records), 2)
        self.assertEqual(records[0]["question"], "What is the capital of France?")
        self.assertEqual(records[0]["ai_response"], "The capital of France is Paris.")
        self.assertEqual(records[0]["reference_answer"], "Paris is the capital.")

    def test_parse_csv_missing_columns(self):
        csv_data = "col1,col2\nval1,val2\n".encode("utf-8")
        with self.assertRaises(ValueError):
            parse_csv_file(csv_data)

    def test_batch_row_orchestration(self):
        q = "What is gravity?"
        a = "Gravity is a fundamental force."
        req = EvaluationInputRequest(question=q, ai_response=a)
        verdict = orchestrator.run_evaluation(req)
        
        self.assertIn(verdict.verdict, ["PASS", "NEEDS_IMPROVEMENT", "FAIL"])
        self.assertIsNotNone(verdict.completeness)
        self.assertIsNotNone(verdict.accuracy)

if __name__ == "__main__":
    unittest.main()
