import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_e2e_single_evaluation_accurate_grounded():
    """End-to-End test of Single Evaluation on accurate grounded response."""
    payload = {
        "question": "When was Super Bowl 50 played and who won?",
        "ai_response": "Super Bowl 50 was played on February 7, 2016. The Denver Broncos defeated the Carolina Panthers 24-10.",
        "reference_answer": "Super Bowl 50 was played on February 7, 2016, and won by the Denver Broncos.",
        "source_document": "Super Bowl 50 was played on February 7, 2016. The Denver Broncos defeated the Carolina Panthers 24-10."
    }

    res = client.post("/api/v1/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["verdict"] in ["PASS", "NEEDS_IMPROVEMENT"]
    assert data["hallucination_risk"] in ["LOW", "MEDIUM"]
    assert data["overall_score"] >= 65.0
    assert data["relevance"]["score"] >= 65.0
    assert data["accuracy"]["score"] >= 60.0
    assert data["hallucination"]["score"] >= 65.0

def test_e2e_single_evaluation_hallucinated():
    """End-to-End test of Single Evaluation detecting hallucinated claims."""
    payload = {
        "question": "What happens if you crack your knuckles and why?",
        "ai_response": "Cracking your knuckles causes severe osteoarthritis in 100% of people because it destroys cartilage permanently.",
        "reference_answer": "Cracking knuckles releases gas bubbles in synovial fluid and does not cause arthritis.",
        "source_document": "Multiple clinical studies prove cracking knuckles does not cause arthritis."
    }

    res = client.post("/api/v1/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["verdict"] in ["FAIL", "NEEDS_IMPROVEMENT"]
    assert data["hallucination_risk"] in ["MEDIUM", "HIGH"]
    assert data["overall_score"] < 75.0
    assert data["hallucination"]["score"] < 70.0
    assert len(data["flagged_claims"]) > 0

def test_e2e_batch_csv_evaluation_and_pdf_export():
    """End-to-End test of uploading CSV batch, verifying metrics, dashboard update, and exporting PDF."""
    csv_content = (
        "question,ai_response,reference_answer,source_document\n"
        "When was Super Bowl 50 played?,Super Bowl 50 was played on February 7 2016,Super Bowl 50 was played on Feb 7 2016,Super Bowl 50 was played on Feb 7 2016.\n"
        "Does cracking knuckles cause arthritis?,Cracking knuckles causes 100% arthritis in all patients,Cracking knuckles does not cause arthritis,Studies prove cracking knuckles does not cause arthritis.\n"
    )

    files = {
        "file": ("e2e_test_batch.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    }

    # 1. Execute Batch
    res = client.post("/api/v1/evaluate/batch", files=files)
    assert res.status_code == 200
    batch_res = res.json()

    assert batch_res["total_records"] == 2
    assert batch_res["successful_records"] == 2
    batch_id = batch_res["batch_id"]

    # 2. Get Batch Detail
    detail_res = client.get(f"/api/v1/evaluate/batch/{batch_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["batch_id"] == batch_id

    # 3. Export PDF Report
    pdf_res = client.get(f"/api/v1/evaluate/batch/{batch_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert pdf_res.content.startswith(b"%PDF-")

    # 4. Check Dashboard Analytics updated
    dash_res = client.get("/api/v1/analytics/dashboard")
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_batches"] >= 1
    assert dash_data["total_evaluated_records"] >= 2
