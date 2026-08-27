import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import evaluate, knowledge_base
from app.kb.ingestion import dataset_ingestor
from app.kb.vector_store import vector_store
from app.config import BASE_DIR

# Setup Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("hallucination_eval_app")

app = FastAPI(
    title="LLM Evaluation & Multi-Agent Hallucination Detection System",
    description="Milestone 1 Foundation: Single Evaluation Submission Interface, Reference Knowledge Base (TruthfulQA / SQuAD), RAG Retrieval, and Multi-Agent Evaluation Layer.",
    version="1.0.0",
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

# Mount Static Files for Frontend Dashboard UI
static_dir = os.path.join(BASE_DIR, "app", "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing LLM Evaluation System...")
    # Check if vector database is empty; if so, seed with TruthfulQA and SQuAD benchmark records
    stats = vector_store.get_stats()
    if stats["total_chunks"] == 0:
        logger.info("Vector database is empty. Auto-seeding TruthfulQA & SQuAD benchmark dataset chunks...")
        dataset_ingestor.ingest_seed_benchmarks()
        logger.info("Auto-seeding complete.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
