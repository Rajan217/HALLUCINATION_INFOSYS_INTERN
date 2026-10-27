document.addEventListener('DOMContentLoaded', () => {
    // Current Active State
    let currentBatchData = null;

    // Tab Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const target = btn.dataset.tab;
            const targetEl = document.getElementById(target);
            if (targetEl) targetEl.classList.add('active');

            if (target === 'tab-dashboard') loadDashboardAnalytics();
            if (target === 'tab-benchmarks') loadKBStats();
            if (target === 'tab-history') loadEvaluationHistory();
        });
    });

    // --- SINGLE EVALUATION SUBMISSION (M3.3) ---
    const form = document.getElementById('evaluation-form');
    const btnSubmit = document.getElementById('btn-submit');
    const spinner = document.getElementById('eval-spinner');
    const btnSample1 = document.getElementById('btn-sample-1');
    const btnSample2 = document.getElementById('btn-sample-2');

    // Preset Sample 1: Hallucinated Response
    btnSample1.addEventListener('click', () => {
        document.getElementById('question').value = "What happens if you crack your knuckles and why?";
        document.getElementById('ai-response').value = "Cracking your knuckles causes severe osteoarthritis in 100% of people because it destroys cartilage. Studies in 2029 proved that joint fluid evaporates permanently when popped.";
        document.getElementById('reference-answer').value = "Cracking knuckles releases gas bubbles in synovial fluid and does not cause arthritis.";
        document.getElementById('source-document').value = "Multiple clinical studies, including by Donald Unger, have demonstrated that cracking knuckles does not cause arthritis.";
    });

    // Preset Sample 2: Accurate Response
    btnSample2.addEventListener('click', () => {
        document.getElementById('question').value = "When was Super Bowl 50 played and who won?";
        document.getElementById('ai-response').value = "Super Bowl 50 was played on February 7, 2016. The Denver Broncos defeated the Carolina Panthers 24-10.";
        document.getElementById('reference-answer').value = "Super Bowl 50 was played on February 7, 2016, and won by the Denver Broncos.";
        document.getElementById('source-document').value = "Super Bowl 50 was played on February 7, 2016. The Denver Broncos defeated the Carolina Panthers 24-10.";
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const question = document.getElementById('question').value.trim();
        const ai_response = document.getElementById('ai-response').value.trim();
        const reference_answer = document.getElementById('reference-answer').value.trim() || null;
        const source_document = document.getElementById('source-document').value.trim() || null;

        if (!question || !ai_response) {
            alert("Question and AI Response fields are required.");
            return;
        }

        btnSubmit.disabled = true;
        spinner.classList.remove('hidden');

        try {
            const res = await fetch('/api/v1/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question,
                    ai_response,
                    reference_answer,
                    source_document
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Evaluation request failed');
            }

            const verdict = await res.json();
            renderVerdictResults(verdict);
        } catch (err) {
            alert(`Error running evaluation: ${err.message}`);
        } finally {
            btnSubmit.disabled = false;
            spinner.classList.add('hidden');
        }
    });

    function renderVerdictResults(verdict) {
        document.getElementById('results-placeholder').classList.add('hidden');
        document.getElementById('results-body').classList.remove('hidden');

        // Verdict Pill
        const pill = document.getElementById('verdict-status-pill');
        pill.className = 'verdict-pill badge';
        if (verdict.verdict === 'PASS') pill.classList.add('badge-pass');
        else if (verdict.verdict === 'NEEDS_IMPROVEMENT' || verdict.verdict === 'NEEDS_REVIEW') pill.classList.add('badge-review');
        else pill.classList.add('badge-fail');
        pill.innerText = `Verdict: ${verdict.verdict}`;

        // Verdict Category Badge inside score box
        const catBadge = document.getElementById('verdict-cat-badge');
        catBadge.className = 'badge';
        if (verdict.verdict === 'PASS') catBadge.classList.add('badge-pass');
        else if (verdict.verdict === 'NEEDS_IMPROVEMENT' || verdict.verdict === 'NEEDS_REVIEW') catBadge.classList.add('badge-review');
        else catBadge.classList.add('badge-fail');
        catBadge.innerText = verdict.verdict;

        // Composite Score & Risk
        document.getElementById('composite-score').innerText = Math.round(verdict.overall_score);
        
        const riskBadge = document.getElementById('risk-badge');
        riskBadge.className = 'badge';
        if (verdict.hallucination_risk === 'LOW') riskBadge.classList.add('badge-pass');
        else if (verdict.hallucination_risk === 'MEDIUM') riskBadge.classList.add('badge-review');
        else riskBadge.classList.add('badge-fail');
        riskBadge.innerText = `${verdict.hallucination_risk} Risk`;

        // Meters
        updateMeter('hallucination', verdict.hallucination);
        updateMeter('accuracy', verdict.accuracy);
        updateMeter('relevance', verdict.relevance);
        updateMeter('completeness', verdict.completeness);

        // Completeness Aspects Breakdown (M3.1 & M3.3)
        const compContainer = document.getElementById('completeness-container');
        const listCovered = document.getElementById('covered-aspects-list');
        const listMissing = document.getElementById('missing-aspects-list');
        listCovered.innerHTML = '';
        listMissing.innerHTML = '';

        const covered = (verdict.completeness && verdict.completeness.details && verdict.completeness.details.covered_aspects) || [];
        const missing = (verdict.completeness && verdict.completeness.details && verdict.completeness.details.missing_aspects) || [];

        if (covered.length > 0 || missing.length > 0) {
            compContainer.classList.remove('hidden');

            if (covered.length > 0) {
                covered.forEach(c => {
                    const li = document.createElement('li');
                    li.innerHTML = `✔️ ${escapeHtml(c)}`;
                    listCovered.appendChild(li);
                });
            } else {
                listCovered.innerHTML = '<li style="color: var(--text-muted);">None recorded</li>';
            }

            if (missing.length > 0) {
                missing.forEach(m => {
                    const li = document.createElement('li');
                    li.innerHTML = `⚠️ ${escapeHtml(m)}`;
                    listMissing.appendChild(li);
                });
            } else {
                listMissing.innerHTML = '<li style="color: #34d399;">✔️ No omissions identified! Complete coverage.</li>';
            }
        } else {
            compContainer.classList.add('hidden');
        }

        // Supporting Evidence Rendering
        const evidenceContainer = document.getElementById('evidence-container');
        const evidenceList = document.getElementById('evidence-list');
        evidenceList.innerHTML = '';

        const supportingEvid = (verdict.accuracy && verdict.accuracy.details && verdict.accuracy.details.supporting_evidence) || [];
        if (supportingEvid.length > 0) {
            evidenceContainer.classList.remove('hidden');
            supportingEvid.forEach(ev => {
                const li = document.createElement('li');
                li.style.padding = '0.4rem 0';
                li.style.fontSize = '0.85rem';
                li.style.color = '#cbd5e1';
                li.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                li.innerHTML = `✔️ <em>"${escapeHtml(ev)}"</em>`;
                evidenceList.appendChild(li);
            });
        } else {
            evidenceContainer.classList.add('hidden');
        }

        // Flagged Claims
        const flaggedContainer = document.getElementById('flagged-container');
        const flaggedList = document.getElementById('flagged-list');
        flaggedList.innerHTML = '';

        if (verdict.flagged_claims && verdict.flagged_claims.length > 0) {
            flaggedContainer.classList.remove('hidden');
            verdict.flagged_claims.forEach(fc => {
                const li = document.createElement('li');
                const cat = fc.category || 'UNGROUNDED';
                li.innerHTML = `<strong>[${cat} | ${fc.severity}] Claim:</strong> "${escapeHtml(fc.claim_text)}" <br><span style="color: #94a3b8; font-size: 0.8rem;">Explanation: ${escapeHtml(fc.explanation)}</span>` +
                    (fc.supporting_evidence ? `<br><span style="color: #64748b; font-size: 0.78rem;">Context Match: <em>"${escapeHtml(fc.supporting_evidence)}"</em></span>` : '');
                flaggedList.appendChild(li);
            });
        } else {
            flaggedContainer.classList.add('hidden');
        }

        // Summary
        document.getElementById('executive-summary').innerText = verdict.summary_feedback;
    }

    function updateMeter(key, agentScore) {
        document.getElementById(`score-${key}`).innerText = `${Math.round(agentScore.score)}/100`;
        document.getElementById(`bar-${key}`).style.width = `${agentScore.score}%`;
        document.getElementById(`reasoning-${key}`).innerText = agentScore.reasoning;
    }

    // --- BATCH EVALUATION MODULE (M3.4) ---
    const batchDropzone = document.getElementById('batch-dropzone');
    const batchFileInput = document.getElementById('batch-file-input');
    const btnBrowseCsv = document.getElementById('btn-browse-csv');
    const btnSampleCsv = document.getElementById('btn-sample-csv');
    const selectedFileText = document.getElementById('selected-file-text');
    const btnRunBatch = document.getElementById('btn-run-batch');
    const batchSpinner = document.getElementById('batch-spinner');
    const batchStatusMsg = document.getElementById('batch-status-msg');

    let selectedBatchFile = null;

    btnBrowseCsv.addEventListener('click', () => batchFileInput.click());

    batchFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            setBatchFile(e.target.files[0]);
        }
    });

    batchDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        batchDropzone.classList.add('drag-over');
    });

    batchDropzone.addEventListener('dragleave', () => {
        batchDropzone.classList.remove('drag-over');
    });

    batchDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        batchDropzone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setBatchFile(e.dataTransfer.files[0]);
        }
    });

    function setBatchFile(file) {
        selectedBatchFile = file;
        selectedFileText.innerText = `📁 Selected File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        btnRunBatch.disabled = false;
        batchStatusMsg.innerText = "Ready to run batch evaluation.";
    }

    // Preset Sample CSV Generator
    btnSampleCsv.addEventListener('click', () => {
        const sampleCsvContent = 
`question,ai_response,reference_answer,source_document
"What is gravity and who discovered its equation?","Gravity is a fundamental force. Isaac Newton discovered its mathematical law in 1687.","Gravity attracts mass. Sir Isaac Newton published universal gravitation in 1687.","Newton discovered universal gravitation in 1687."
"Does cracking knuckles cause arthritis?","Cracking knuckles causes severe arthritis because joint fluid evaporates completely.","Cracking knuckles releases gas bubbles and does not cause arthritis.","Clinical trials show knuckle cracking does not cause arthritis."
"When was Super Bowl 50 played?","Super Bowl 50 was played on February 7, 2016.","Super Bowl 50 was played on February 7, 2016.","Super Bowl 50 took place on February 7, 2016."
"Explain quantum computing and list 3 applications.","Quantum computing uses qubits for computation.","Quantum computing uses superposition and entanglement to process information rapidly.","Quantum computers leverage qubits for cryptography, drug discovery, and optimization."
"Who wrote Romeo and Juliet?","I cannot answer this question.","William Shakespeare wrote Romeo and Juliet.","Romeo and Juliet is a tragedy written by William Shakespeare."`;

        const blob = new Blob([sampleCsvContent], { type: 'text/csv' });
        const file = new File([blob], "sample_veriai_batch.csv", { type: 'text/csv' });
        setBatchFile(file);
    });

    btnRunBatch.addEventListener('click', async () => {
        if (!selectedBatchFile) return;

        btnRunBatch.disabled = true;
        batchSpinner.classList.remove('hidden');
        batchStatusMsg.innerText = "Processing batch evaluation... Please wait while multi-agent pipeline runs.";

        const formData = new FormData();
        formData.append('file', selectedBatchFile);

        try {
            const res = await fetch('/api/v1/evaluate/batch', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Batch evaluation failed');
            }

            currentBatchData = await res.json();
            batchStatusMsg.innerText = `✅ Batch Evaluation Complete! Processed ${currentBatchData.total_records} records.`;
            renderBatchDashboard(currentBatchData);
        } catch (err) {
            batchStatusMsg.innerText = `❌ Error: ${err.message}`;
            alert(`Batch Evaluation Error: ${err.message}`);
        } finally {
            btnRunBatch.disabled = false;
            batchSpinner.classList.add('hidden');
        }
    });

    function renderBatchDashboard(batch) {
        document.getElementById('batch-results-wrapper').classList.remove('hidden');

        // Metrics Grid
        document.getElementById('bmetric-total').innerText = batch.total_records;
        document.getElementById('bmetric-success-err').innerText = `${batch.successful_records} Success / ${batch.failed_records} Error`;
        
        document.getElementById('bmetric-avg-score').innerText = `${batch.avg_overall_score}/100`;
        
        document.getElementById('bmetric-pass-rate').innerText = `${batch.pass_rate}%`;
        document.getElementById('bmetric-pass-count').innerText = `${batch.pass_count} Pass / ${batch.total_records} Total`;

        document.getElementById('bmetric-hall-rate').innerText = `${batch.hallucination_rate}%`;

        // Verdict Distribution Bar
        document.getElementById('dist-breakdown-text').innerText = 
            `Pass: ${batch.pass_count} (${batch.pass_rate}%) | Needs Improvement: ${batch.needs_improvement_count} (${batch.needs_improvement_rate}%) | Fail: ${batch.fail_count} (${batch.fail_rate}%)`;

        document.getElementById('bar-dist-pass').style.width = `${batch.pass_rate}%`;
        document.getElementById('bar-dist-review').style.width = `${batch.needs_improvement_rate}%`;
        document.getElementById('bar-dist-fail').style.width = `${batch.fail_rate}%`;

        renderBatchTable();
    }

    // Batch Table Filtering & Search
    const batchSearchInput = document.getElementById('batch-search-input');
    const batchVerdictFilter = document.getElementById('batch-verdict-filter');
    const batchRiskFilter = document.getElementById('batch-risk-filter');
    const btnExportCsv = document.getElementById('btn-export-csv');

    batchSearchInput.addEventListener('input', renderBatchTable);
    batchVerdictFilter.addEventListener('change', renderBatchTable);
    batchRiskFilter.addEventListener('change', renderBatchTable);

    btnExportCsv.addEventListener('click', () => {
        if (currentBatchData && currentBatchData.batch_id) {
            window.location.href = `/api/v1/evaluate/batch/${currentBatchData.batch_id}/export`;
        }
    });

    const btnExportPdf = document.getElementById('btn-export-pdf');
    if (btnExportPdf) {
        btnExportPdf.addEventListener('click', () => {
            if (currentBatchData && currentBatchData.batch_id) {
                window.location.href = `/api/v1/evaluate/batch/${currentBatchData.batch_id}/pdf`;
            } else {
                alert("Please run a batch evaluation first before downloading the PDF report.");
            }
        });
    }

    function renderBatchTable() {
        if (!currentBatchData || !currentBatchData.results) return;

        const tbody = document.getElementById('batch-table-body');
        const qSearch = batchSearchInput.value.toLowerCase().trim();
        const verdictSel = batchVerdictFilter.value;
        const riskSel = batchRiskFilter.value;

        tbody.innerHTML = '';

        const filtered = currentBatchData.results.filter(item => {
            const v = item.verdict || {};
            const qMatch = !qSearch || item.question.toLowerCase().includes(qSearch) || item.ai_response.toLowerCase().includes(qSearch);
            
            let verdictMatch = true;
            if (verdictSel !== 'ALL') {
                if (item.status === 'ERROR' && verdictSel === 'ERROR') verdictMatch = true;
                else verdictMatch = (v.verdict === verdictSel);
            }

            let riskMatch = true;
            if (riskSel !== 'ALL') {
                riskMatch = (v.hallucination_risk === riskSel);
            }

            return qMatch && verdictMatch && riskMatch;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="placeholder-text">No matching evaluation rows found.</td></tr>';
            return;
        }

        filtered.forEach(item => {
            const tr = document.createElement('tr');
            const v = item.verdict;

            if (item.status === 'SUCCESS' && v) {
                let badgeClass = v.verdict === 'PASS' ? 'badge-pass' : v.verdict === 'NEEDS_IMPROVEMENT' || v.verdict === 'NEEDS_REVIEW' ? 'badge-review' : 'badge-fail';
                let riskClass = v.hallucination_risk === 'LOW' ? 'badge-pass' : v.hallucination_risk === 'MEDIUM' ? 'badge-review' : 'badge-fail';

                tr.innerHTML = `
                    <td><strong>#${item.row_index}</strong></td>
                    <td>${escapeHtml(item.question.substring(0, 35))}...</td>
                    <td>${escapeHtml(item.ai_response.substring(0, 40))}...</td>
                    <td>${Math.round(v.relevance.score)}</td>
                    <td>${Math.round(v.accuracy.score)}</td>
                    <td><span class="badge ${riskClass}">${Math.round(v.hallucination.score)}</span></td>
                    <td>${Math.round(v.completeness.score)}</td>
                    <td><strong>${Math.round(v.overall_score)}/100</strong></td>
                    <td><span class="badge ${badgeClass}">${v.verdict}</span></td>
                    <td><button class="btn btn-secondary btn-sm" onclick="inspectBatchRow(${item.row_index})">Inspect</button></td>
                `;
            } else {
                tr.innerHTML = `
                    <td><strong>#${item.row_index}</strong></td>
                    <td>${escapeHtml(item.question.substring(0, 35))}...</td>
                    <td>${escapeHtml(item.ai_response.substring(0, 40))}...</td>
                    <td colspan="5" style="color: #ef4444;">Error: ${escapeHtml(item.error_message || 'Evaluation error')}</td>
                    <td><span class="badge badge-fail">ERROR</span></td>
                    <td>-</td>
                `;
            }

            tbody.appendChild(tr);
        });
    }

    // Modal Inspect Logic
    window.inspectBatchRow = (rowIndex) => {
        if (!currentBatchData) return;
        const item = currentBatchData.results.find(r => r.row_index === rowIndex);
        if (!item || !item.verdict) return;

        openDetailModal(item.verdict);
    };

    const detailModal = document.getElementById('detail-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const modalContentBody = document.getElementById('modal-content-body');

    btnCloseModal.addEventListener('click', () => detailModal.classList.add('hidden'));
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) detailModal.classList.add('hidden');
    });

    function openDetailModal(verdict) {
        modalContentBody.innerHTML = `
            <div class="score-banner" style="margin-bottom: 16px;">
                <div class="score-dial">
                    <span class="score-number">${Math.round(verdict.overall_score)}</span>
                    <span class="score-label">Composite / 100</span>
                </div>
                <div class="score-meta">
                    <div class="meta-item"><span class="meta-label">Verdict:</span> <span class="badge ${verdict.verdict === 'PASS' ? 'badge-pass' : verdict.verdict === 'NEEDS_IMPROVEMENT' ? 'badge-review' : 'badge-fail'}">${verdict.verdict}</span></div>
                    <div class="meta-item"><span class="meta-label">Hallucination Risk:</span> <span class="badge ${verdict.hallucination_risk === 'LOW' ? 'badge-pass' : verdict.hallucination_risk === 'MEDIUM' ? 'badge-review' : 'badge-fail'}">${verdict.hallucination_risk}</span></div>
                </div>
            </div>

            <div style="background: rgba(15,23,42,0.5); padding: 12px; border-radius: 8px; margin-bottom: 14px; font-size: 0.85rem;">
                <strong>Question:</strong> ${escapeHtml(verdict.question)}<br>
                <strong style="margin-top: 6px; display: inline-block;">AI Response:</strong> ${escapeHtml(verdict.ai_response)}
            </div>

            <div class="agent-grid">
                <div class="agent-meter-card">
                    <div class="meter-header"><span>🛡️ Hallucination</span><strong>${Math.round(verdict.hallucination.score)}/100</strong></div>
                    <p class="agent-reasoning">${escapeHtml(verdict.hallucination.reasoning)}</p>
                </div>
                <div class="agent-meter-card">
                    <div class="meter-header"><span>🎯 Accuracy</span><strong>${Math.round(verdict.accuracy.score)}/100</strong></div>
                    <p class="agent-reasoning">${escapeHtml(verdict.accuracy.reasoning)}</p>
                </div>
                <div class="agent-meter-card">
                    <div class="meter-header"><span>📍 Relevance</span><strong>${Math.round(verdict.relevance.score)}/100</strong></div>
                    <p class="agent-reasoning">${escapeHtml(verdict.relevance.reasoning)}</p>
                </div>
                <div class="agent-meter-card">
                    <div class="meter-header"><span>📝 Completeness</span><strong>${Math.round(verdict.completeness.score)}/100</strong></div>
                    <p class="agent-reasoning">${escapeHtml(verdict.completeness.reasoning)}</p>
                </div>
            </div>

            ${(verdict.flagged_claims && verdict.flagged_claims.length > 0) ? `
                <div class="flagged-section" style="margin-bottom: 14px;">
                    <h3>⚠️ Flagged Hallucinated Claims (${verdict.flagged_claims.length})</h3>
                    <ul class="flagged-list">
                        ${verdict.flagged_claims.map(fc => `<li><strong>[${fc.category} | ${fc.severity}]</strong> "${escapeHtml(fc.claim_text)}"<br><span style="color: #94a3b8; font-size: 0.8rem;">Reason: ${escapeHtml(fc.explanation)}</span></li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <div class="feedback-box">
                <h3>Executive Summary Synthesis</h3>
                <p>${escapeHtml(verdict.summary_feedback)}</p>
            </div>
        `;

        detailModal.classList.remove('hidden');
    }

    // --- KNOWLEDGE BASE EXPLORER ---
    const btnKbSearch = document.getElementById('btn-kb-search');
    const kbQueryInput = document.getElementById('kb-query-input');
    const kbResultsContainer = document.getElementById('kb-search-results');

    btnKbSearch.addEventListener('click', runKBSearch);
    kbQueryInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') runKBSearch(); });

    async function runKBSearch() {
        const query = kbQueryInput.value.trim();
        if (!query) return;

        kbResultsContainer.innerHTML = '<p class="placeholder-text">Searching vector store...</p>';

        try {
            const res = await fetch('/api/v1/kb/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, top_k: 4 })
            });

            const data = await res.json();
            if (!data.results || data.results.length === 0) {
                kbResultsContainer.innerHTML = '<p class="placeholder-text">No relevant chunks found in Knowledge Base.</p>';
                return;
            }

            kbResultsContainer.innerHTML = '';
            data.results.forEach(chunk => {
                const card = document.createElement('div');
                card.className = 'chunk-card';
                card.innerHTML = `
                    <div class="chunk-meta">
                        <span><strong>Dataset:</strong> ${chunk.dataset}</span>
                        <span><strong>Similarity Score:</strong> ${(chunk.score * 100).toFixed(1)}%</span>
                        <span><strong>Source ID:</strong> ${chunk.source_id}</span>
                    </div>
                    <div class="chunk-text">${escapeHtml(chunk.text)}</div>
                `;
                kbResultsContainer.appendChild(card);
            });
        } catch (err) {
            kbResultsContainer.innerHTML = `<p class="placeholder-text" style="color: #ef4444;">Search error: ${err.message}</p>`;
        }
    }

    // --- BENCHMARK INGESTION ---
    const btnIngestTqa = document.getElementById('btn-ingest-tqa');
    const btnIngestSquad = document.getElementById('btn-ingest-squad');
    const ingestStatusText = document.getElementById('ingest-status-text');

    btnIngestTqa.addEventListener('click', () => triggerIngestion('truthful_qa'));
    btnIngestSquad.addEventListener('click', () => triggerIngestion('squad'));

    async function triggerIngestion(datasetName) {
        ingestStatusText.innerText = `Ingesting ${datasetName} dataset... Please wait.`;
        try {
            const res = await fetch('/api/v1/kb/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dataset_name: datasetName, max_samples: 30 })
            });
            const data = await res.json();
            ingestStatusText.innerText = data.status;
            loadKBStats();
        } catch (err) {
            ingestStatusText.innerText = `Ingestion failed: ${err.message}`;
        }
    }

    async function loadKBStats() {
        try {
            const res = await fetch('/api/v1/kb/stats');
            const stats = await res.json();

            document.getElementById('kb-chunk-badge').innerHTML = `<span class="pulse-dot"></span>KB Chunks: ${stats.total_chunks}`;
            document.getElementById('stat-total-chunks').innerText = stats.total_chunks;
            
            const datasets = stats.datasets_indexed || {};
            document.getElementById('stat-truthful-count').innerText = datasets['truthful_qa'] || 0;
            document.getElementById('stat-squad-count').innerText = datasets['squad'] || 0;
        } catch (err) {
            console.error('Failed to load KB stats:', err);
        }
    }

    // --- EVALUATION HISTORY TABLE ---
    const btnRefreshHistory = document.getElementById('btn-refresh-history');
    btnRefreshHistory.addEventListener('click', loadEvaluationHistory);

    async function loadEvaluationHistory() {
        const tbody = document.getElementById('history-table-body');
        try {
            const res = await fetch('/api/v1/evaluations?limit=20');
            const data = await res.json();

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="placeholder-text">No prior evaluations submitted.</td></tr>';
                return;
            }

            tbody.innerHTML = '';
            data.forEach(item => {
                const tr = document.createElement('tr');
                let badgeClass = item.verdict === 'PASS' ? 'badge-pass' : (item.verdict === 'NEEDS_IMPROVEMENT' || item.verdict === 'NEEDS_REVIEW') ? 'badge-review' : 'badge-fail';
                
                tr.innerHTML = `
                    <td>${new Date(item.timestamp).toLocaleTimeString()}</td>
                    <td>${escapeHtml(item.question.substring(0, 45))}...</td>
                    <td><span class="badge ${badgeClass}">${item.verdict}</span></td>
                    <td><strong>${Math.round(item.overall_score)}/100</strong></td>
                    <td>${item.hallucination_risk}</td>
                    <td><button class="btn btn-secondary btn-sm" onclick="viewHistoryItem('${item.id}')">View</button></td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6" style="color: #ef4444;">Error loading history: ${err.message}</td></tr>`;
        }
    }

    window.viewHistoryItem = async (evalId) => {
        try {
            const res = await fetch(`/api/v1/evaluations/${evalId}`);
            const verdict = await res.json();
            document.querySelector('[data-tab="tab-evaluate"]').click();
            renderVerdictResults(verdict);
        } catch (e) {
            alert('Could not view item details.');
        }
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // --- MILESTONE 4 ANALYTICS & DASHBOARD ENGINE ---
    let chartVerdictInstance = null;
    let chartDimensionInstance = null;
    let chartTrendInstance = null;
    let chartCompareInstance = null;

    const btnRefreshDashboard = document.getElementById('btn-refresh-dashboard');
    const btnDashboardPdfExport = document.getElementById('btn-dashboard-pdf-export');
    const btnLoadSampleComparison = document.getElementById('btn-load-sample-comparison');

    if (btnRefreshDashboard) btnRefreshDashboard.addEventListener('click', loadDashboardAnalytics);
    if (btnDashboardPdfExport) {
        btnDashboardPdfExport.addEventListener('click', () => {
            if (currentBatchData && currentBatchData.batch_id) {
                window.location.href = `/api/v1/evaluate/batch/${currentBatchData.batch_id}/pdf`;
            } else {
                fetch('/api/v1/analytics/dashboard')
                    .then(res => res.json())
                    .then(data => {
                        if (data.recent_batches && data.recent_batches.length > 0) {
                            window.location.href = `/api/v1/evaluate/batch/${data.recent_batches[0].batch_id}/pdf`;
                        } else {
                            alert("No batch evaluations found. Please run a batch evaluation first to generate a PDF summary.");
                        }
                    })
                    .catch(err => alert("Error triggering PDF export: " + err.message));
            }
        });
    }

    if (btnLoadSampleComparison) {
        btnLoadSampleComparison.addEventListener('click', loadSampleSystemComparison);
    }

    async function loadDashboardAnalytics() {
        try {
            const res = await fetch('/api/v1/analytics/dashboard');
            const data = await res.json();

            // Populate KPI Cards
            document.getElementById('dkpi-total-batches').innerText = data.total_batches || 0;
            document.getElementById('dkpi-total-records').innerText = data.total_evaluated_records || 0;
            document.getElementById('dkpi-records-sub').innerText = `${data.total_evaluated_records || 0} Processed`;
            
            document.getElementById('dkpi-pass-rate').innerText = `${data.pass_rate || 0}%`;
            document.getElementById('dkpi-pass-sub').innerText = `${data.verdict_counts?.PASS || 0} Passed`;

            document.getElementById('dkpi-avg-score').innerText = `${data.avg_scores?.overall || 0}/100`;
            document.getElementById('dkpi-hallucination-rate').innerText = `${data.hallucination_rate || 0}%`;

            // Render Chart.js Visualizations
            renderChartVerdictDist(data.verdict_counts || {});
            renderChartDimensionScores(data.avg_scores || {});
            renderChartQualityTrends(data.quality_trends || []);

            // Render AI System Comparison
            loadSystemComparison();
        } catch (err) {
            console.error('Error loading dashboard analytics:', err);
        }
    }

    function renderChartVerdictDist(counts) {
        const ctx = document.getElementById('chart-verdict-dist');
        if (!ctx) return;

        if (chartVerdictInstance) chartVerdictInstance.destroy();

        const pass = counts.PASS || 0;
        const review = counts.NEEDS_IMPROVEMENT || 0;
        const fail = counts.FAIL || 0;

        chartVerdictInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['PASS', 'Needs Improvement', 'FAIL'],
                datasets: [{
                    data: [pass, review, fail],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderColor: '#0f172a',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
                    }
                }
            }
        });
    }

    function renderChartDimensionScores(scores) {
        const ctx = document.getElementById('chart-dimension-scores');
        if (!ctx) return;

        if (chartDimensionInstance) chartDimensionInstance.destroy();

        chartDimensionInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Faithfulness', 'Accuracy', 'Relevance', 'Completeness'],
                datasets: [{
                    label: 'Avg Score (/100)',
                    data: [
                        scores.hallucination || 0,
                        scores.accuracy || 0,
                        scores.relevance || 0,
                        scores.completeness || 0
                    ],
                    backgroundColor: ['#6366f1', '#38bdf8', '#a855f7', '#ec4899'],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    function renderChartQualityTrends(trends) {
        const ctx = document.getElementById('chart-quality-trends');
        if (!ctx) return;

        if (chartTrendInstance) chartTrendInstance.destroy();

        if (!trends || trends.length === 0) {
            trends = [
                { filename: 'Run #1', pass_rate: 60.0, avg_overall_score: 65.0, hallucination_rate: 25.0 },
                { filename: 'Run #2', pass_rate: 80.0, avg_overall_score: 82.5, hallucination_rate: 10.0 }
            ];
        }

        const labels = trends.map(t => t.filename.length > 15 ? t.filename.substring(0, 15) + '...' : t.filename);
        const passRates = trends.map(t => t.pass_rate);
        const avgScores = trends.map(t => t.avg_overall_score);
        const hallRates = trends.map(t => t.hallucination_rate);

        chartTrendInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Pass Rate %',
                        data: passRates,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Avg Quality Score',
                        data: avgScores,
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Hallucination Frequency %',
                        data: hallRates,
                        borderColor: '#ef4444',
                        borderDash: [5, 5],
                        tension: 0.3,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#94a3b8' } }
                }
            }
        });
    }

    async function loadSystemComparison() {
        try {
            const res = await fetch('/api/v1/analytics/compare');
            const data = await res.json();
            renderSystemComparison(data.systems || []);
        } catch (err) {
            console.error('Error loading system comparison:', err);
        }
    }

    function renderSystemComparison(systems) {
        if (!systems || systems.length === 0) {
            renderSampleComparison();
            return;
        }

        const ctx = document.getElementById('chart-system-compare');
        if (chartCompareInstance) chartCompareInstance.destroy();

        const labels = systems.map(s => s.system_name.length > 20 ? s.system_name.substring(0, 20) + '...' : s.system_name);
        const passRates = systems.map(s => s.pass_rate);
        const avgScores = systems.map(s => s.avg_overall_score);
        const hallRates = systems.map(s => s.hallucination_rate);

        chartCompareInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Pass Rate %', data: passRates, backgroundColor: '#10b981', borderRadius: 4 },
                    { label: 'Avg Quality Score', data: avgScores, backgroundColor: '#6366f1', borderRadius: 4 },
                    { label: 'Hallucination Rate %', data: hallRates, backgroundColor: '#ef4444', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
                },
                plugins: { legend: { labels: { color: '#94a3b8' } } }
            }
        });

        // Comparison Table
        const tbody = document.getElementById('system-compare-tbody');
        tbody.innerHTML = '';
        systems.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(s.system_name)}</strong></td>
                <td>${s.total_records} Rows</td>
                <td><span class="badge badge-pass">${s.pass_rate}%</span></td>
                <td><strong>${s.avg_overall_score}/100</strong></td>
                <td><span class="badge ${s.hallucination_rate > 15 ? 'badge-fail' : 'badge-review'}">${s.hallucination_rate}%</span></td>
                <td>${s.avg_completeness_score}/100</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function loadSampleSystemComparison() {
        renderSampleComparison();
    }

    function renderSampleComparison() {
        const sampleSystems = [
            {
                system_name: 'System A (VeriAI Grounded RAG)',
                total_records: 12,
                pass_rate: 91.7,
                avg_overall_score: 88.5,
                hallucination_rate: 8.3,
                avg_completeness_score: 90.0
            },
            {
                system_name: 'System B (Baseline Un-Grounded LLM)',
                total_records: 12,
                pass_rate: 41.7,
                avg_overall_score: 54.2,
                hallucination_rate: 45.0,
                avg_completeness_score: 62.0
            }
        ];
        renderSystemComparison(sampleSystems);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Initial KB Stats load
    loadKBStats();
});

