import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import evaluate, knowledge_base, batch_evaluate
from app.kb.ingestion import dataset_ingestor
from app.kb.vector_store import vector_store
from app.config import BASE_DIR

# Setup Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("hallucination_eval_app")

app = FastAPI(
    title="VeriAI — LLM Evaluation & Multi-Agent Hallucination Detection System",
    description="Enterprise Multi-Agent LLM Evaluation Engine with Completeness, Accuracy, Relevance, Hallucination Detection, Verdict Synthesis, and Batch Evaluation Module.",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for browser dashboard interactions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(evaluate.router)
app.include_router(knowledge_base.router)
app.include_router(batch_evaluate.router)

# Mount Static Files for Frontend Dashboard UI
static_dir = os.path.join(BASE_DIR, "app", "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing LLM Evaluation System...")
    stats = vector_store.get_stats()
    if stats["total_chunks"] == 0:
        logger.info("Vector database is empty. Auto-seeding TruthfulQA & SQuAD benchmark dataset chunks...")
        dataset_ingestor.ingest_seed_benchmarks()
        logger.info("Auto-seeding complete.")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
