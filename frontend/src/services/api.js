/**
 * API Service for AI Response Validation System
 * Directly communicates with existing FastAPI backend endpoints
 */

const API_BASE = '/api/v1';

export const api = {
  // Single Evaluation
  async evaluate(data) {
    const res = await fetch(`${API_BASE}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Evaluation failed with status ${res.status}`);
    }
    return res.json();
  },

  // List past single evaluations
  async getEvaluations(limit = 50, verdictFilter = null) {
    let url = `${API_BASE}/evaluations?limit=${limit}`;
    if (verdictFilter) url += `&verdict_filter=${encodeURIComponent(verdictFilter)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch evaluations');
    return res.json();
  },

  // Get single evaluation detail
  async getEvaluationById(id) {
    const res = await fetch(`${API_BASE}/evaluations/${id}`);
    if (!res.ok) throw new Error('Failed to fetch evaluation details');
    return res.json();
  },

  // Batch Evaluation
  async runBatch(fileOrJson) {
    let options = {};
    if (fileOrJson instanceof File) {
      const formData = new FormData();
      formData.append('file', fileOrJson);
      options = {
        method: 'POST',
        body: formData,
      };
    } else {
      options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileOrJson),
      };
    }
    const res = await fetch(`${API_BASE}/evaluate/batch`, options);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Batch evaluation failed with status ${res.status}`);
    }
    return res.json();
  },

  // List past batches
  async getBatches() {
    const res = await fetch(`${API_BASE}/evaluate/batch`);
    if (!res.ok) return [];
    return res.json();
  },

  // Get batch details
  async getBatchById(batchId) {
    const res = await fetch(`${API_BASE}/evaluate/batch/${batchId}`);
    if (!res.ok) throw new Error('Failed to fetch batch');
    return res.json();
  },

  // Export batch CSV
  getBatchExportUrl(batchId) {
    return `${API_BASE}/evaluate/batch/${batchId}/export`;
  },

  // Export batch PDF
  getBatchPdfUrl(batchId) {
    return `${API_BASE}/evaluate/batch/${batchId}/pdf`;
  },

  // Analytics Dashboard
  async getDashboardAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard analytics');
    return res.json();
  },

  // Vector store stats
  async getKBStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch KB stats');
    return res.json();
  },
};
