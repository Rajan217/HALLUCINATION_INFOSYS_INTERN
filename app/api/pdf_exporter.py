import io
import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

def generate_pdf_report(batch_data: Dict[str, Any]) -> bytes:
    """
    Generates a professional, publication-ready PDF evaluation audit report for a batch evaluation.
    Includes Executive Summary, Pass/Fail metrics, Dimension Score Breakdown, Flagged Hallucination Analysis,
    and Improvement Recommendations.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    COLOR_PRIMARY = colors.HexColor("#1e1b4b")   # Deep navy/indigo
    COLOR_ACCENT = colors.HexColor("#4f46e5")    # Indigo accent
    COLOR_SUCCESS = colors.HexColor("#10b981")   # Emerald green
    COLOR_WARNING = colors.HexColor("#f59e0b")   # Amber
    COLOR_FAIL = colors.HexColor("#ef4444")      # Red
    COLOR_BG_LIGHT = colors.HexColor("#f8fafc")  # Light gray-blue
    COLOR_TEXT = colors.HexColor("#1e293b")      # Dark slate
    COLOR_MUTED = colors.HexColor("#64748b")     # Muted gray

    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=COLOR_PRIMARY,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        "ReportSubTitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=COLOR_MUTED,
        spaceAfter=12
    )

    h2_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=COLOR_PRIMARY,
        spaceBefore=14,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=COLOR_TEXT
    )

    bold_body = ParagraphStyle(
        "ReportBodyBold",
        parent=body_style,
        fontName="Helvetica-Bold"
    )

    meta_label = ParagraphStyle("MetaLabel", parent=body_style, fontName="Helvetica-Bold", textColor=COLOR_PRIMARY)
    meta_val = ParagraphStyle("MetaVal", parent=body_style, textColor=COLOR_TEXT)

    story = []

    # 1. Header Banner
    story.append(Paragraph("🛡️ VeriAI — LLM Evaluation & Hallucination Audit Report", title_style))
    story.append(Paragraph("Enterprise Multi-Agent Verification • Automated Quality Benchmarking Engine", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_ACCENT, spaceAfter=12))

    # Metadata Card Box
    batch_id = batch_data.get("batch_id", "N/A")
    filename = batch_data.get("filename", "batch_eval.csv")
    total_records = batch_data.get("total_records", 0)
    succ_records = batch_data.get("successful_records", 0)
    eval_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    meta_data = [
        [
            Paragraph("Batch ID:", meta_label), Paragraph(str(batch_id)[:18] + "...", meta_val),
            Paragraph("Dataset File:", meta_label), Paragraph(str(filename), meta_val)
        ],
        [
            Paragraph("Date Generated:", meta_label), Paragraph(eval_date, meta_val),
            Paragraph("Evaluated Rows:", meta_label), Paragraph(f"{succ_records} / {total_records} Success", meta_val)
        ]
    ]

    meta_table = Table(meta_data, colWidths=[90, 180, 90, 180])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), COLOR_BG_LIGHT),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # 2. Executive Summary & Aggregated Metrics
    story.append(Paragraph("1. Executive Summary & Key Performance Indicators", h2_style))
    
    pass_rate = batch_data.get("pass_rate", 0.0)
    avg_score = batch_data.get("avg_overall_score", 0.0)
    hall_rate = batch_data.get("hallucination_rate", 0.0)
    fail_rate = batch_data.get("fail_rate", 0.0)
    needs_imp_rate = batch_data.get("needs_improvement_rate", 0.0)

    pass_cnt = batch_data.get("pass_count", 0)
    needs_imp_cnt = batch_data.get("needs_improvement_count", 0)
    fail_cnt = batch_data.get("fail_count", 0)

    exec_summary_text = (
        f"This batch audit evaluated <b>{succ_records}</b> AI-generated response pairs. "
        f"The evaluated system achieved an overall composite quality score of <b>{avg_score}/100</b>, "
        f"with an overall pass rate of <b>{pass_rate}%</b> ({pass_cnt} rows PASSED). "
        f"Hallucinated content or unsupported claims were detected in <b>{hall_rate}%</b> of evaluated responses. "
        f"A total of <b>{fail_cnt}</b> responses FAILED quality benchmarks and <b>{needs_imp_cnt}</b> responses were flagged for minor improvements."
    )
    story.append(Paragraph(exec_summary_text, body_style))
    story.append(Spacer(1, 10))

    # KPI Metric Cards Table
    kpi_headers = ["Metric Indicator", "Score / Rate", "Benchmark Status", "Distribution Count"]
    kpi_rows = [
        [
            Paragraph("Overall Quality Score", bold_body),
            Paragraph(f"<b>{avg_score} / 100</b>", body_style),
            Paragraph("High Quality" if avg_score >= 80 else ("Moderate" if avg_score >= 60 else "Low"), bold_body),
            Paragraph(f"{succ_records} Total Processed", body_style)
        ],
        [
            Paragraph("Pass Rate (PASS)", bold_body),
            Paragraph(f"<b>{pass_rate}%</b>", ParagraphStyle("PPass", parent=body_style, textColor=COLOR_SUCCESS, fontName="Helvetica-Bold")),
            Paragraph("✅ Target Met" if pass_rate >= 75 else "⚠️ Action Required", body_style),
            Paragraph(f"{pass_cnt} Rows", body_style)
        ],
        [
            Paragraph("Needs Improvement", bold_body),
            Paragraph(f"<b>{needs_imp_rate}%</b>", ParagraphStyle("PReview", parent=body_style, textColor=COLOR_WARNING, fontName="Helvetica-Bold")),
            Paragraph("Minor Non-Compliance", body_style),
            Paragraph(f"{needs_imp_cnt} Rows", body_style)
        ],
        [
            Paragraph("Fail Rate (FAIL)", bold_body),
            Paragraph(f"<b>{fail_rate}%</b>", ParagraphStyle("PFail", parent=body_style, textColor=COLOR_FAIL, fontName="Helvetica-Bold")),
            Paragraph("Critical Failures", body_style),
            Paragraph(f"{fail_cnt} Rows", body_style)
        ],
        [
            Paragraph("Hallucination Frequency", bold_body),
            Paragraph(f"<b>{hall_rate}%</b>", ParagraphStyle("PHall", parent=body_style, textColor=COLOR_FAIL if hall_rate > 20 else COLOR_WARNING, fontName="Helvetica-Bold")),
            Paragraph("High Risk Alert" if hall_rate > 20 else "Acceptable Risk", body_style),
            Paragraph("Flagged Sub-spans", body_style)
        ]
    ]

    kpi_table = Table([kpi_headers] + kpi_rows, colWidths=[150, 110, 150, 130])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT]),
        ('PADDING', (0,1), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    # Header cells white text
    for i, h in enumerate(kpi_headers):
        kpi_table._cellvalues[0][i] = Paragraph(f"<font color='white'><b>{h}</b></font>", body_style)

    story.append(kpi_table)
    story.append(Spacer(1, 14))

    # 3. Multi-Agent Dimension Breakdown
    story.append(Paragraph("2. Multi-Agent Dimension Evaluation Breakdown", h2_style))
    
    avg_rel = batch_data.get("avg_relevance_score", 0.0)
    avg_acc = batch_data.get("avg_accuracy_score", 0.0)
    avg_hal = batch_data.get("avg_hallucination_score", 0.0)
    avg_comp = batch_data.get("avg_completeness_score", 0.0)

    dim_headers = ["Evaluation Dimension", "Weight", "Avg Score / 100", "Dimension Status & Assessment"]
    dim_rows = [
        [
            Paragraph("🛡️ Faithfulness / Non-Hallucination", bold_body),
            Paragraph("35%", body_style),
            Paragraph(f"<b>{avg_hal}</b>", bold_body),
            Paragraph("Unsubstantiated claims & grounding check" if avg_hal >= 75 else "⚠️ High ungrounded content frequency", body_style)
        ],
        [
            Paragraph("🎯 Factual Accuracy", bold_body),
            Paragraph("25%", body_style),
            Paragraph(f"<b>{avg_acc}</b>", bold_body),
            Paragraph("Ground-truth reference alignment" if avg_acc >= 75 else "⚠️ Ground-truth fact mismatches detected", body_style)
        ],
        [
            Paragraph("📍 Query Relevance", bold_body),
            Paragraph("20%", body_style),
            Paragraph(f"<b>{avg_rel}</b>", bold_body),
            Paragraph("Prompt responsiveness & focus" if avg_rel >= 75 else "⚠️ Off-topic or tangential content", body_style)
        ],
        [
            Paragraph("📝 Completeness", bold_body),
            Paragraph("20%", body_style),
            Paragraph(f"<b>{avg_comp}</b>", bold_body),
            Paragraph("Prompt coverage & omission check" if avg_comp >= 75 else "⚠️ Omits key requested aspects", body_style)
        ]
    ]

    dim_table = Table([dim_headers] + dim_rows, colWidths=[160, 50, 100, 230])
    dim_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), COLOR_ACCENT),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    for i, h in enumerate(dim_headers):
        dim_table._cellvalues[0][i] = Paragraph(f"<font color='white'><b>{h}</b></font>", body_style)

    story.append(dim_table)
    story.append(Spacer(1, 14))

    # 4. Flagged Responses & High-Risk Hallucinations Audit
    story.append(Paragraph("3. Flagged Responses & High-Risk Hallucination Audit", h2_style))
    
    results: List[Dict[str, Any]] = batch_data.get("results", [])
    flagged_items = []
    for r in results:
        if r.get("status") == "SUCCESS":
            v = r.get("verdict", {})
            risk = v.get("hallucination_risk", "LOW")
            flagged_claims = v.get("flagged_claims", [])
            verdict_cat = v.get("verdict", "PASS")
            if risk in ["MEDIUM", "HIGH"] or len(flagged_claims) > 0 or verdict_cat in ["FAIL", "NEEDS_IMPROVEMENT"]:
                flagged_items.append((r, v))

    if not flagged_items:
        story.append(Paragraph("✅ <i>No high-risk hallucinated responses or critical failures were flagged in this evaluation run.</i>", body_style))
    else:
        story.append(Paragraph(f"A total of <b>{len(flagged_items)}</b> responses were flagged for potential hallucinations, factual drift, or prompt omissions:", body_style))
        story.append(Spacer(1, 6))

        flag_headers = ["Row", "Question", "Verdict / Risk", "Score", "Flagged Spans & Agent Feedback"]
        flag_rows = []

        for r, v in flagged_items[:8]:  # Limit top 8 flagged in PDF summary
            r_idx = r.get("row_index")
            q_text = Paragraph(str(r.get("question", ""))[:90] + ("..." if len(str(r.get("question", ""))) > 90 else ""), body_style)
            risk = v.get("hallucination_risk", "LOW")
            verdict_cat = v.get("verdict", "PASS")
            overall = v.get("overall_score", 0)
            
            risk_color = "#ef4444" if risk == "HIGH" or verdict_cat == "FAIL" else "#f59e0b"
            verdict_cell = Paragraph(f"<b><font color='{risk_color}'>{verdict_cat}</font></b><br/><font color='{COLOR_MUTED.hexval()}'>Risk: {risk}</font>", body_style)

            claims = v.get("flagged_claims", [])
            claims_text = ", ".join([f"'{c}'" for c in claims[:2]]) if claims else "Factual drift / low completeness"
            feedback = v.get("summary_feedback", "")
            feedback_text = Paragraph(f"<b>Flagged:</b> {claims_text}<br/><i>{feedback[:110]}...</i>", body_style)

            flag_rows.append([
                Paragraph(f"<b>#{r_idx}</b>", bold_body),
                q_text,
                verdict_cell,
                Paragraph(f"<b>{overall}</b>", bold_body),
                feedback_text
            ])

        flag_table = Table([flag_headers] + flag_rows, colWidths=[35, 140, 85, 45, 235])
        flag_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), COLOR_PRIMARY),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, COLOR_BG_LIGHT]),
            ('PADDING', (0,0), (-1,-1), 5),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))

        for i, h in enumerate(flag_headers):
            flag_table._cellvalues[0][i] = Paragraph(f"<font color='white'><b>{h}</b></font>", body_style)

        story.append(flag_table)

    story.append(Spacer(1, 14))

    # 5. Actionable Improvement Recommendations
    story.append(Paragraph("4. System Improvement & Optimization Recommendations", h2_style))
    
    recommendations = []
    if avg_hal < 75 or hall_rate > 15:
        recommendations.append("• <b>Grounding Enhancement:</b> Increase RAG retrieval top-k context or enforce strict system prompt constraints requiring the LLM to cite provided documents verbatim before generating answers.")
    if avg_acc < 75:
        recommendations.append("• <b>Factuality Verification:</b> Cross-index domain knowledge bases with authoritative reference datasets (e.g., SQuAD / TruthfulQA) to eliminate hallucinated entity attributes.")
    if avg_comp < 75:
        recommendations.append("• <b>Prompt Instruction Alignment:</b> Update system prompts with explicit step-by-step instructions (e.g. Chain-of-Thought) ensuring all sub-questions or constraints in user prompts are thoroughly answered.")
    if avg_rel < 80:
        recommendations.append("• <b>Query Focus:</b> Apply query expansion or re-ranking on context retrieval to prevent off-topic or tangential background context from confusing the generator.")
    
    if not recommendations:
        recommendations.append("• <b>Maintain Current Performance:</b> The evaluated AI system demonstrates high alignment across all evaluation dimensions. Continue periodic automated monitoring using VeriAI batch evaluation suites.")

    for rec in recommendations:
        story.append(Paragraph(rec, body_style))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 14))

    # Footer Notice
    story.append(HRFlowable(width="100%", thickness=0.5, color=COLOR_MUTED, spaceAfter=8))
    story.append(Paragraph(
        "<i>VeriAI Evaluation Report • Generated automatically by VeriAI Multi-Agent Evaluation Engine • Confidential</i>",
        ParagraphStyle("Footer", parent=body_style, fontSize=8, textColor=COLOR_MUTED, alignment=TA_CENTER)
    ))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
