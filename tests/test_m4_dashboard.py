import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_dashboard_analytics_endpoint():
    """Test dashboard analytics endpoint returns expected metric structure."""
    response = client.get("/api/v1/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()

    assert "total_batches" in data
    assert "total_evaluated_records" in data
    assert "pass_rate" in data
    assert "fail_rate" in data
    assert "needs_improvement_rate" in data
    assert "hallucination_rate" in data
    assert "avg_scores" in data
    assert "verdict_counts" in data
    assert "quality_trends" in data

    avg_scores = data["avg_scores"]
    assert "overall" in avg_scores
    assert "relevance" in avg_scores
    assert "accuracy" in avg_scores
    assert "hallucination" in avg_scores
    assert "completeness" in avg_scores

def test_system_comparison_endpoint():
    """Test side-by-side AI system comparison analytics endpoint."""
    response = client.get("/api/v1/analytics/compare")
    assert response.status_code == 200
    data = response.json()
    assert "systems" in data
    assert isinstance(data["systems"], list)
