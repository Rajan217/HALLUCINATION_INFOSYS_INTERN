import unittest
from app.models.schema import EvaluationInputRequest

class TestInputModule(unittest.TestCase):
    def test_input_request_valid(self):
        req = EvaluationInputRequest(
            question="What is the capital of France?",
            ai_response="Paris is the capital of France.",
            reference_answer="Paris",
            source_document="Paris is the capital and most populous city of France."
        )
        self.assertEqual(req.question, "What is the capital of France?")
        self.assertEqual(req.ai_response, "Paris is the capital of France.")
        self.assertEqual(req.reference_answer, "Paris")

    def test_input_request_strip_whitespace(self):
        req = EvaluationInputRequest(
            question="  What is the capital of France?  ",
            ai_response="   Paris is the capital.  "
        )
        self.assertEqual(req.question, "What is the capital of France?")
        self.assertEqual(req.ai_response, "Paris is the capital.")

    def test_input_request_empty_validation(self):
        with self.assertRaises(ValueError):
            EvaluationInputRequest(question="   ", ai_response="Valid response")

        with self.assertRaises(ValueError):
            EvaluationInputRequest(question="Valid Question?", ai_response="   ")

if __name__ == "__main__":
    unittest.main()
