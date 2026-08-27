document.addEventListener('DOMContentLoaded', () => {
    // Tab Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const target = btn.dataset.tab;
            document.getElementById(target).classList.add('active');

            if (target === 'tab-benchmarks') loadKBStats();
            if (target === 'tab-history') loadEvaluationHistory();
        });
    });

    // Form Submission & Presets
    const form = document.getElementById('evaluation-form');
    const btnSubmit = document.getElementById('btn-submit');
    const spinner = document.getElementById('eval-spinner');
    const btnSample1 = document.getElementById('btn-sample-1');
    const btnSample2 = document.getElementById('btn-sample-2');

    // Preset Sample 1: Hallucinated Response
    btnSample1.addEventListener('click', () => {
        document.getElementById('question').value = "What happens if you crack your knuckles?";
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
        else if (verdict.verdict === 'NEEDS_REVIEW') pill.classList.add('badge-review');
        else pill.classList.add('badge-fail');
        pill.innerText = `Verdict: ${verdict.verdict}`;

        // Composite Score & Risk
        document.getElementById('composite-score').innerText = Math.round(verdict.overall_score);
        
        const riskBadge = document.getElementById('risk-badge');
        riskBadge.className = 'badge';
        if (verdict.hallucination_risk === 'LOW') riskBadge.classList.add('badge-pass');
        else if (verdict.hallucination_risk === 'MEDIUM') riskBadge.classList.add('badge-review');
        else riskBadge.classList.add('badge-fail');
        riskBadge.innerText = `${verdict.hallucination_risk} Risk`;

        // Grounding Source
        const gSourceText = document.getElementById('grounding-source-text');
        if (verdict.source_document || verdict.reference_answer) {
            gSourceText.innerText = 'Explicit Reference Context';
        } else if (verdict.retrieved_contexts && verdict.retrieved_contexts.length > 0) {
            gSourceText.innerText = `RAG Retrieved Context (${verdict.retrieved_contexts.length} chunks)`;
        } else {
            gSourceText.innerText = 'Heuristic Evaluation';
        }

        // Meters
        updateMeter('hallucination', verdict.hallucination);
        updateMeter('accuracy', verdict.accuracy);
        updateMeter('relevance', verdict.relevance);
        updateMeter('completeness', verdict.completeness);

        // Flagged Claims
        const flaggedContainer = document.getElementById('flagged-container');
        const flaggedList = document.getElementById('flagged-list');
        flaggedList.innerHTML = '';

        if (verdict.flagged_claims && verdict.flagged_claims.length > 0) {
            flaggedContainer.classList.remove('hidden');
            verdict.flagged_claims.forEach(fc => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>[${fc.severity}] Claim:</strong> "${fc.claim_text}" <br><span style="color: #94a3b8; font-size: 0.8rem;">Reason: ${fc.explanation}</span>`;
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

    // Knowledge Base Explorer Search
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

    // Benchmark Ingestion
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

    // Load KB Stats
    async function loadKBStats() {
        try {
            const res = await fetch('/api/v1/kb/stats');
            const stats = await res.json();

            document.getElementById('kb-chunk-badge').innerText = `KB Chunks: ${stats.total_chunks}`;
            document.getElementById('stat-total-chunks').innerText = stats.total_chunks;
            
            const datasets = stats.datasets_indexed || {};
            document.getElementById('stat-truthful-count').innerText = datasets['truthful_qa'] || 0;
            document.getElementById('stat-squad-count').innerText = datasets['squad'] || 0;
        } catch (err) {
            console.error('Failed to load KB stats:', err);
        }
    }

    // History Table
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
                let badgeClass = item.verdict === 'PASS' ? 'badge-pass' : item.verdict === 'NEEDS_REVIEW' ? 'badge-review' : 'badge-fail';
                
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
            // Switch to evaluate tab and display
            document.querySelector('[data-tab="tab-evaluate"]').click();
            renderVerdictResults(verdict);
        } catch (e) {
            alert('Could not view item details.');
        }
    };

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Initial KB Stats fetch
    loadKBStats();
});
