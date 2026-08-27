import os
from pathlib import Path

# Base Directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Data Paths
DATA_DIR = BASE_DIR / "data"
CHROMA_DB_DIR = DATA_DIR / "chroma_db"
EVALUATIONS_FILE = DATA_DIR / "evaluations.json"

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(CHROMA_DB_DIR, exist_ok=True)

# Embedding Settings
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

# Scoring Weights
WEIGHT_HALLUCINATION = 0.35
WEIGHT_ACCURACY = 0.25
WEIGHT_RELEVANCE = 0.20
WEIGHT_COMPLETENESS = 0.20

# Hallucination Penalty Override Threshold
HALLUCINATION_FAIL_THRESHOLD = 40.0

# Verdict Thresholds
PASS_THRESHOLD = 85.0
NEEDS_REVIEW_THRESHOLD = 60.0

# Vector Store Default Top-K
DEFAULT_TOP_K = 3
