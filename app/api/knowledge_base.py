from fastapi import APIRouter, HTTPException
from app.models.schema import KBSearchRequest, KBSearchResponse, BenchmarkIngestRequest, BenchmarkStatusResponse
from app.kb.vector_store import vector_store
from app.kb.ingestion import dataset_ingestor

router = APIRouter(prefix="/api/v1/kb", tags=["Reference Knowledge Base & Benchmarks"])

@router.post("/search", response_model=KBSearchResponse)
async def search_knowledge_base(search_req: KBSearchRequest):
    """Performs semantic similarity retrieval search against the indexed Reference Knowledge Base."""
    try:
        results = vector_store.search(
            query=search_req.query,
            top_k=search_req.top_k,
            dataset_filter=search_req.dataset
        )
        return KBSearchResponse(
            query=search_req.query,
            results=results,
            total_found=len(results)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Knowledge base search failed: {str(e)}")

@router.post("/ingest", response_model=BenchmarkStatusResponse)
async def ingest_benchmark_dataset(ingest_req: BenchmarkIngestRequest):
    """
    Triggers fetching, cleaning, chunking, embedding generation, and vector indexing
    for TruthfulQA or SQuAD public benchmarks.
    """
    dataset_name = ingest_req.dataset_name.lower()
    if dataset_name not in ["truthful_qa", "truthfulqa", "squad"]:
        raise HTTPException(status_code=400, detail="Supported datasets: 'truthful_qa' or 'squad'")

    try:
        records = dataset_ingestor.fetch_huggingface_dataset(
            dataset_name=dataset_name,
            max_samples=ingest_req.max_samples
        )
        indexed_count = dataset_ingestor.process_and_index_records(records)
        stats = vector_store.get_stats()
        return BenchmarkStatusResponse(
            total_chunks=stats["total_chunks"],
            datasets_indexed=stats["datasets_indexed"],
            status=f"Successfully indexed {indexed_count} chunks from '{dataset_name}' benchmark."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark dataset ingestion failed: {str(e)}")

@router.get("/stats", response_model=BenchmarkStatusResponse)
async def get_knowledge_base_stats():
    """Returns vector store statistics including indexed datasets and chunk counts."""
    stats = vector_store.get_stats()
    return BenchmarkStatusResponse(
        total_chunks=stats["total_chunks"],
        datasets_indexed=stats["datasets_indexed"],
        status=stats["status"]
    )
