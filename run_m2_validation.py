"""
VeriAI — Milestone 2 Agent Evaluation & Consistency Validation Suite
Runs representative Q&A pairs from TruthfulQA, SQuAD, and edge cases through the
Relevance, Accuracy, and Hallucination agents, measuring precision, recall,
scoring consistency, and reasoning quality.
"""

import time
import json
import sys
import os

sys.path.insert(0, os.path.abspath("."))

from app.models.schema import EvaluationInputRequest
from app.agents.orchestrator import orchestrator
from tests.test_benchmark_validation import BENCHMARK_TEST_SET

def run_validation():
    print("=" * 80)
    print(" VERIAI -- MILESTONE 2: AGENT EVALUATION & CONSISTENCY VALIDATION")
    print("=" * 80)
    print(f"Total Benchmark Test Cases: {len(BENCHMARK_TEST_SET)}\n")

    results = []
    tp = 0 # True Positives (correctly flagged hallucination/high risk)
    fp = 0 # False Positives (incorrectly flagged hallucination on clean text)
    tn = 0 # True Negatives (clean text correctly passed with low risk)
    fn = 0 # False Negatives (hallucination missed)

    start_time = time.time()

    for idx, tc in enumerate(BENCHMARK_TEST_SET, 1):
        print(f"[{idx}/{len(BENCHMARK_TEST_SET)}] Evaluating Test Case: '{tc['id']}' ({tc['dataset']} - {tc['category']})")
        print(f"    * Question   : {tc['question']}")
        print(f"    * AI Response: {tc['ai_response'][:70]}...")

        input_req = EvaluationInputRequest(
            question=tc["question"],
            ai_response=tc["ai_response"],
            reference_answer=tc["reference_answer"]
        )

        verdict = orchestrator.run_evaluation(input_req)

        # Categorize Detection Outcome
        is_expected_hallucination = tc["expected_hallucination_risk"] == "HIGH"
        is_actual_hallucination = verdict.hallucination_risk in ["HIGH", "MEDIUM"] and len(verdict.flagged_claims) > 0

        if is_expected_hallucination and is_actual_hallucination:
            tp += 1
            status_tag = "[PASS] MATCH (TP)"
        elif not is_expected_hallucination and not is_actual_hallucination:
            tn += 1
            status_tag = "[PASS] MATCH (TN)"
        elif not is_expected_hallucination and is_actual_hallucination:
            fp += 1
            status_tag = "[FAIL] FALSE POSITIVE (FP)"
        else:
            fn += 1
            status_tag = "[FAIL] FALSE NEGATIVE (FN)"

        print(f"    -> Overall Verdict : [{verdict.verdict}] (Score: {verdict.overall_score}/100)")
        print(f"    -> Relevance Agent : {verdict.relevance.score}/100 [{verdict.relevance.details.get('relevance_category')}]")
        print(f"    -> Accuracy Agent  : {verdict.accuracy.score}/100 [{verdict.accuracy.details.get('accuracy_category')}]")
        print(f"    -> Hallucination   : {verdict.hallucination.score}/100 [Risk: {verdict.hallucination_risk}]")
        print(f"    -> Status Tag      : {status_tag}")
        if verdict.flagged_claims:
            print(f"    -> Flagged Claims  : {len(verdict.flagged_claims)} claim(s)")
            for fc in verdict.flagged_claims:
                print(f"       * [{fc.category} | {fc.severity}] {fc.claim_text} -> {fc.explanation}")
        if verdict.accuracy.details.get("supporting_evidence"):
            print(f"    -> Supporting Evid : {verdict.accuracy.details['supporting_evidence'][0][:80]}...")
        print("-" * 80)

        results.append({
            "id": tc["id"],
            "category": tc["category"],
            "verdict": verdict.verdict,
            "overall_score": verdict.overall_score,
            "relevance_score": verdict.relevance.score,
            "accuracy_score": verdict.accuracy.score,
            "hallucination_score": verdict.hallucination.score,
            "hallucination_risk": verdict.hallucination_risk,
            "flagged_claims_count": len(verdict.flagged_claims),
            "status_tag": status_tag
        })

    elapsed = round(time.time() - start_time, 2)

    # Metric Calculations
    precision = round(tp / max(1, (tp + fp)) * 100, 1)
    recall = round(tp / max(1, (tp + fn)) * 100, 1)
    f1_score = round(2 * (precision * recall) / max(1.0, (precision + recall)), 1)
    accuracy = round((tp + tn) / len(BENCHMARK_TEST_SET) * 100, 1)

    print("\n" + "=" * 80)
    print(" MILESTONE 2 AGENT VALIDATION SUMMARY REPORT")
    print("=" * 80)
    print(f" Total Test Cases Evaluated : {len(BENCHMARK_TEST_SET)}")
    print(f" Execution Duration        : {elapsed} seconds")
    print(f" Overall Benchmark Accuracy: {accuracy}%")
    print(f" Hallucination Precision   : {precision}%")
    print(f" Hallucination Recall      : {recall}%")
    print(f" Hallucination F1-Score    : {f1_score}%")
    print(f" Confusion Matrix Breakdown: TP={tp}, TN={tn}, FP={fp}, FN={fn}")
    print("=" * 80)

    if accuracy >= 80.0 and fp == 0 and fn == 0:
        print("\n[SUCCESS] MILESTONE 2 VALIDATION SUCCESSFUL: All agent scoring and claim detection criteria satisfied!")
    else:
        print("\n[NOTICE] VALIDATION NOTICE: Check individual test outputs above for edge-case tuning.")

if __name__ == "__main__":
    run_validation()
