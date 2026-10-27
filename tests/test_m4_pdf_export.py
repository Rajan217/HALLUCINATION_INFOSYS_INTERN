import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.pdf_exporter import generate_pdf_report

client = TestClient(app)

def test_generate_pdf_report_function():
    """Test pure function generation of ReportLab PDF report."""
    sample_batch_data = {
        "batch_id": "test-batch-uuid-12345",
        "filename": "benchmark_test.csv",
        "total_records": 5,
        "successful_records": 5,
        "failed_records": 0,
        "pass_count": 4,
        "needs_improvement_count": 1,
        "fail_count": 0,
        "pass_rate": 80.0,
        "needs_improvement_rate": 20.0,
        "fail_rate": 0.0,
        "avg_overall_score": 85.2,
        "avg_relevance_score": 90.0,
        "avg_accuracy_score": 88.0,
        "avg_hallucination_score": 82.0,
        "avg_completeness_score": 84.0,
        "hallucination_rate": 20.0,
        "results": [
            {
                "row_index": 1,
                "question": "What happens if you crack your knuckles?",
                "ai_response": "Cracking knuckles releases gas bubbles in synovial fluid and does not cause arthritis.",
                "status": "SUCCESS",
                "verdict": {
                    "overall_score": 92.0,
                    "verdict": "PASS",
                    "hallucination_risk": "LOW",
                    "relevance": {"score": 95.0},
                    "accuracy": {"score": 95.0},
                    "hallucination": {"score": 90.0},
                    "completeness": {"score": 88.0},
                    "flagged_claims": [],
                    "summary_feedback": "Accurate and well-grounded response."
                }
            },
            {
                "row_index": 2,
                "question": "Does cracking knuckles cause arthritis?",
                "ai_response": "Yes, cracking your knuckles causes severe osteoarthritis in 100% of people.",
                "status": "SUCCESS",
                "verdict": {
                    "overall_score": 35.0,
                    "verdict": "FAIL",
                    "hallucination_risk": "HIGH",
                    "relevance": {"score": 70.0},
                    "accuracy": {"score": 20.0},
                    "hallucination": {"score": 10.0},
                    "completeness": {"score": 50.0},
                    "flagged_claims": ["causes severe osteoarthritis in 100% of people"],
                    "summary_feedback": "Response contains severe hallucination contrary to medical evidence."
                }
            }
        ]
    }

    pdf_bytes = generate_pdf_report(sample_batch_data)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF-")

def test_pdf_export_endpoint_not_found():
    """Test PDF export endpoint returns 404 for invalid batch ID."""
    response = client.get("/api/v1/evaluate/batch/non-existent-batch-id-xyz/pdf")
    assert response.status_code == 404
