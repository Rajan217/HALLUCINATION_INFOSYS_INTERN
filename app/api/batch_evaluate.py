import io
import csv
import json
import os
import uuid
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from fastapi.responses import Response

from app.models.schema import (
    EvaluationInputRequest,
    EvaluationVerdict,
    BatchItemResult,
    BatchEvaluationResponse
)
from app.agents.orchestrator import orchestrator
from app.config import DATA_DIR
from app.api.pdf_exporter import generate_pdf_report

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["Batch Evaluation Module"])


BATCH_EVALUATIONS_FILE = DATA_DIR / "batch_evaluations.json"

def _load_batches() -> List[dict]:
    if not os.path.exists(BATCH_EVALUATIONS_FILE):
        return []
    try:
        with open(BATCH_EVALUATIONS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading batch evaluations: {e}")
        return []

def _save_batch(batch_data: dict):
    batches = _load_batches()
    batches.insert(0, batch_data)
    try:
        with open(BATCH_EVALUATIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(batches, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving batch evaluation: {e}")

def parse_csv_file(content: bytes) -> List[Dict[str, str]]:
    """
    Parses uploaded CSV bytes, detecting header names and extracting Q&A rows.
    """
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    reader = csv.reader(io.StringIO(text))
    rows = list(reader)
    if not rows:
        raise ValueError("CSV file is empty.")

    header = [h.strip().lower() for h in rows[0]]
    if len(rows) < 2:
        raise ValueError("CSV file contains header only with no data rows.")

    # Find column indices
    q_col = next((i for i, h in enumerate(header) if h in ["question", "prompt", "q", "user_question", "query"]), None)
    a_col = next((i for i, h in enumerate(header) if h in ["ai_response", "response", "answer", "ai_answer", "generated_response", "a"]), None)
    ref_col = next((i for i, h in enumerate(header) if h in ["reference_answer", "reference", "ground_truth", "ref_answer", "ref"]), None)
    src_col = next((i for i, h in enumerate(header) if h in ["source_document", "source", "context", "document", "source_doc"]), None)

    if q_col is None or a_col is None:
        raise ValueError(
            f"CSV missing required columns. Headers found: {header}. "
            f"CSV must contain a question column ('question', 'prompt', 'q') and an AI response column ('ai_response', 'response', 'answer')."
        )

    records = []
    for r_idx, row in enumerate(rows[1:], start=1):
        if not row or not any(field.strip() for field in row):
            continue  # skip blank lines
        
        q_val = row[q_col].strip() if q_col < len(row) else ""
        a_val = row[a_col].strip() if a_col < len(row) else ""
        ref_val = row[ref_col].strip() if (ref_col is not None and ref_col < len(row)) else None
        src_val = row[src_col].strip() if (src_col is not None and src_col < len(row)) else None

        records.append({
            "row_index": r_idx,
            "question": q_val,
            "ai_response": a_val,
            "reference_answer": ref_val if ref_val else None,
            "source_document": src_val if src_val else None
        })

    return records

@router.post("/evaluate/batch", response_model=BatchEvaluationResponse, status_code=200)
async def upload_batch_evaluation(file: UploadFile = File(...)):
    """
    Upload a CSV of question-answer pairs for automated batch evaluation.
    Executes Relevance, Accuracy, Hallucination, Completeness, and Verdict for all rows.
    Returns aggregated metrics, verdict distribution, and per-row structured results.
    """
    if not file.filename.lower().endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only CSV files (.csv) are supported for batch evaluation.")

    try:
        content = await file.read()
        raw_records = parse_csv_file(content)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error reading batch CSV: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    batch_id = str(uuid.uuid4())
    item_results: List[BatchItemResult] = []

    success_count = 0
    fail_count = 0
    pass_cnt = 0
    needs_imp_cnt = 0
    verdict_fail_cnt = 0

    tot_overall = 0.0
    tot_rel = 0.0
    tot_acc = 0.0
    tot_hal = 0.0
    tot_comp = 0.0
    hallucination_trigger_count = 0

    for rec in raw_records:
        r_idx = rec["row_index"]
        q = rec["question"]
        a = rec["ai_response"]

        if not q or len(q) < 3 or not a:
            item_results.append(BatchItemResult(
                row_index=r_idx,
                question=q or "[Empty Question]",
                ai_response=a or "[Empty Response]",
                status="ERROR",
                error_message="Missing required question or AI response text."
            ))
            fail_count += 1
            continue

        try:
            input_req = EvaluationInputRequest(
                question=q,
                ai_response=a,
                reference_answer=rec.get("reference_answer"),
                source_document=rec.get("source_document")
            )
            verdict: EvaluationVerdict = orchestrator.run_evaluation(input_req)

            success_count += 1
            tot_overall += verdict.overall_score
            tot_rel += verdict.relevance.score
            tot_acc += verdict.accuracy.score
            tot_hal += verdict.hallucination.score
            tot_comp += verdict.completeness.score

            if verdict.verdict == "PASS":
                pass_cnt += 1
            elif verdict.verdict in ["NEEDS_IMPROVEMENT", "NEEDS_REVIEW"]:
                needs_imp_cnt += 1
            else:
                verdict_fail_cnt += 1

            if verdict.hallucination_risk in ["MEDIUM", "HIGH"] or len(verdict.flagged_claims) > 0:
                hallucination_trigger_count += 1

            item_results.append(BatchItemResult(
                row_index=r_idx,
                question=q,
                ai_response=a,
                reference_answer=rec.get("reference_answer"),
                source_document=rec.get("source_document"),
                status="SUCCESS",
                verdict=verdict
            ))
        except Exception as e:
            logger.error(f"Error evaluating batch row {r_idx}: {e}")
            item_results.append(BatchItemResult(
                row_index=r_idx,
                question=q,
                ai_response=a,
                status="ERROR",
                error_message=str(e)
            ))
            fail_count += 1

    total_records = len(raw_records)
    succ_denom = max(1, success_count)

    avg_overall = round(tot_overall / succ_denom, 1) if success_count > 0 else 0.0
    avg_rel = round(tot_rel / succ_denom, 1) if success_count > 0 else 0.0
    avg_acc = round(tot_acc / succ_denom, 1) if success_count > 0 else 0.0
    avg_hal = round(tot_hal / succ_denom, 1) if success_count > 0 else 0.0
    avg_comp = round(tot_comp / succ_denom, 1) if success_count > 0 else 0.0

    pass_rate = round((pass_cnt / succ_denom) * 100, 1) if success_count > 0 else 0.0
    needs_imp_rate = round((needs_imp_cnt / succ_denom) * 100, 1) if success_count > 0 else 0.0
    verdict_fail_rate = round((verdict_fail_cnt / succ_denom) * 100, 1) if success_count > 0 else 0.0
    hallucination_rate = round((hallucination_trigger_count / succ_denom) * 100, 1) if success_count > 0 else 0.0

    batch_response = BatchEvaluationResponse(
        batch_id=batch_id,
        filename=file.filename,
        total_records=total_records,
        successful_records=success_count,
        failed_records=fail_count,
        pass_count=pass_cnt,
        needs_improvement_count=needs_imp_cnt,
        fail_count=verdict_fail_cnt,
        pass_rate=pass_rate,
        needs_improvement_rate=needs_imp_rate,
        fail_rate=verdict_fail_rate,
        avg_overall_score=avg_overall,
        avg_relevance_score=avg_rel,
        avg_accuracy_score=avg_acc,
        avg_hallucination_score=avg_hal,
        avg_completeness_score=avg_comp,
        hallucination_rate=hallucination_rate,
        results=item_results
    )

    _save_batch(batch_response.model_dump())
    return batch_response

@router.get("/evaluate/batch", response_model=List[dict])
async def list_batch_evaluations(limit: int = Query(10, ge=1, le=50)):
    """List recent batch evaluation runs."""
    batches = _load_batches()
    summaries = []
    for b in batches[:limit]:
        b_copy = dict(b)
        b_copy.pop("results", None)  # Return summary metadata only
        summaries.append(b_copy)
    return summaries

@router.get("/evaluate/batch/{batch_id}", response_model=dict)
async def get_batch_evaluation_by_id(batch_id: str):
    """Retrieve full batch evaluation details by batch UUID."""
    batches = _load_batches()
    for b in batches:
        if b.get("batch_id") == batch_id:
            return b
    raise HTTPException(status_code=404, detail=f"Batch ID '{batch_id}' not found.")

@router.get("/evaluate/batch/{batch_id}/export")
async def export_batch_csv(batch_id: str):
    """Export batch evaluation results as a downloadable CSV file."""
    batches = _load_batches()
    target_batch = None
    for b in batches:
        if b.get("batch_id") == batch_id:
            target_batch = b
            break

    if not target_batch:
        raise HTTPException(status_code=404, detail=f"Batch ID '{batch_id}' not found.")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Row", "Status", "Question", "AI Response", "Verdict",
        "Overall Score", "Hallucination Risk", "Relevance Score",
        "Accuracy Score", "Hallucination Score", "Completeness Score",
        "Flagged Claims Count", "Summary Feedback"
    ])

    for item in target_batch.get("results", []):
        r_idx = item.get("row_index")
        status = item.get("status")
        q = item.get("question")
        a = item.get("ai_response")
        v = item.get("verdict") or {}

        if status == "SUCCESS" and v:
            writer.writerow([
                r_idx,
                status,
                q,
                a,
                v.get("verdict"),
                v.get("overall_score"),
                v.get("hallucination_risk"),
                v.get("relevance", {}).get("score"),
                v.get("accuracy", {}).get("score"),
                v.get("hallucination", {}).get("score"),
                v.get("completeness", {}).get("score"),
                len(v.get("flagged_claims", [])),
                v.get("summary_feedback")
            ])
        else:
            writer.writerow([
                r_idx,
                status,
                q,
                a,
                "N/A",
                "N/A",
                "N/A",
                "N/A",
                "N/A",
                "N/A",
                "N/A",
                0,
                item.get("error_message", "Error evaluating row")
            ])

    filename = f"veriai_batch_{batch_id[:8]}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/evaluate/batch/{batch_id}/pdf")
async def export_batch_pdf(batch_id: str):
    """
    Generates and returns a downloadable structured PDF evaluation audit report for a batch evaluation run.
    """
    batches = _load_batches()
    target_batch = None
    for b in batches:
        if b.get("batch_id") == batch_id:
            target_batch = b
            break

    if not target_batch:
        raise HTTPException(status_code=404, detail=f"Batch ID '{batch_id}' not found.")

    try:
        pdf_bytes = generate_pdf_report(target_batch)
    except Exception as e:
        logger.error(f"Error generating PDF report for batch {batch_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {str(e)}")

    pdf_filename = f"veriai_audit_report_{batch_id[:8]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={pdf_filename}"}
    )

@router.get("/analytics/dashboard")
async def get_dashboard_analytics():
    """
    Provides aggregated scoring metrics, pass/fail rates, dimension averages, hallucination frequency,
    and historical quality trends across all batch evaluation runs.
    """
    batches = _load_batches()
    if not batches:
        return {
            "total_batches": 0,
            "total_evaluated_records": 0,
            "pass_rate": 0.0,
            "fail_rate": 0.0,
            "needs_improvement_rate": 0.0,
            "hallucination_rate": 0.0,
            "avg_scores": {
                "overall": 0.0,
                "relevance": 0.0,
                "accuracy": 0.0,
                "hallucination": 0.0,
                "completeness": 0.0
            },
            "verdict_counts": {"PASS": 0, "NEEDS_IMPROVEMENT": 0, "FAIL": 0},
            "quality_trends": [],
            "recent_batches": []
        }

    total_records = sum(b.get("successful_records", 0) for b in batches)
    total_pass = sum(b.get("pass_count", 0) for b in batches)
    total_needs_imp = sum(b.get("needs_improvement_count", 0) for b in batches)
    total_fail = sum(b.get("fail_count", 0) for b in batches)

    denom = max(1, total_records)
    global_pass_rate = round((total_pass / denom) * 100, 1)
    global_needs_imp_rate = round((total_needs_imp / denom) * 100, 1)
    global_fail_rate = round((total_fail / denom) * 100, 1)

    # Calculate weighted averages for dimensions
    tot_overall = sum(b.get("avg_overall_score", 0.0) * b.get("successful_records", 0) for b in batches)
    tot_rel = sum(b.get("avg_relevance_score", 0.0) * b.get("successful_records", 0) for b in batches)
    tot_acc = sum(b.get("avg_accuracy_score", 0.0) * b.get("successful_records", 0) for b in batches)
    tot_hal = sum(b.get("avg_hallucination_score", 0.0) * b.get("successful_records", 0) for b in batches)
    tot_comp = sum(b.get("avg_completeness_score", 0.0) * b.get("successful_records", 0) for b in batches)
    
    tot_hall_rate = sum(b.get("hallucination_rate", 0.0) * b.get("successful_records", 0) for b in batches)

    avg_overall = round(tot_overall / denom, 1)
    avg_rel = round(tot_rel / denom, 1)
    avg_acc = round(tot_acc / denom, 1)
    avg_hal = round(tot_hal / denom, 1)
    avg_comp = round(tot_comp / denom, 1)
    global_hallucination_rate = round(tot_hall_rate / denom, 1)

    # Quality trends per batch run (chronological order)
    quality_trends = []
    for idx, b in enumerate(reversed(batches)):
        quality_trends.append({
            "run_index": idx + 1,
            "batch_id": b.get("batch_id"),
            "filename": b.get("filename", f"Run #{idx+1}"),
            "pass_rate": b.get("pass_rate", 0.0),
            "avg_overall_score": b.get("avg_overall_score", 0.0),
            "hallucination_rate": b.get("hallucination_rate", 0.0),
            "avg_relevance_score": b.get("avg_relevance_score", 0.0),
            "avg_accuracy_score": b.get("avg_accuracy_score", 0.0),
            "avg_hallucination_score": b.get("avg_hallucination_score", 0.0),
            "avg_completeness_score": b.get("avg_completeness_score", 0.0),
            "total_records": b.get("successful_records", 0)
        })

    # Summary of recent 5 batches
    recent_batches = []
    for b in batches[:5]:
        b_summary = dict(b)
        b_summary.pop("results", None)
        recent_batches.append(b_summary)

    return {
        "total_batches": len(batches),
        "total_evaluated_records": total_records,
        "pass_rate": global_pass_rate,
        "needs_improvement_rate": global_needs_imp_rate,
        "fail_rate": global_fail_rate,
        "hallucination_rate": global_hallucination_rate,
        "avg_scores": {
            "overall": avg_overall,
            "relevance": avg_rel,
            "accuracy": avg_acc,
            "hallucination": avg_hal,
            "completeness": avg_comp
        },
        "verdict_counts": {
            "PASS": total_pass,
            "NEEDS_IMPROVEMENT": total_needs_imp,
            "FAIL": total_fail
        },
        "quality_trends": quality_trends,
        "recent_batches": recent_batches
    }

@router.get("/analytics/compare")
async def compare_ai_systems(batch_ids: Optional[str] = Query(None, description="Comma-separated batch IDs to compare")):
    """
    Compares metrics side-by-side across distinct batch runs / AI systems.
    """
    batches = _load_batches()
    if not batches:
        return {"systems": []}

    target_batches = []
    if batch_ids:
        requested_ids = [b_id.strip() for b_id in batch_ids.split(",") if b_id.strip()]
        for b_id in requested_ids:
            found = next((b for b in batches if b.get("batch_id") == b_id or b.get("batch_id", "").startswith(b_id)), None)
            if found:
                target_batches.append(found)
    
    if not target_batches:
        # Default: compare top 2-3 batches
        target_batches = batches[:3]

    comparisons = []
    for idx, b in enumerate(target_batches):
        system_name = f"System Run #{idx+1} ({b.get('filename', 'Batch')})"
        comparisons.append({
            "system_name": system_name,
            "batch_id": b.get("batch_id"),
            "filename": b.get("filename"),
            "total_records": b.get("successful_records", 0),
            "pass_rate": b.get("pass_rate", 0.0),
            "fail_rate": b.get("fail_rate", 0.0),
            "hallucination_rate": b.get("hallucination_rate", 0.0),
            "avg_overall_score": b.get("avg_overall_score", 0.0),
            "avg_relevance_score": b.get("avg_relevance_score", 0.0),
            "avg_accuracy_score": b.get("avg_accuracy_score", 0.0),
            "avg_hallucination_score": b.get("avg_hallucination_score", 0.0),
            "avg_completeness_score": b.get("avg_completeness_score", 0.0),
        })

    return {"systems": comparisons}

