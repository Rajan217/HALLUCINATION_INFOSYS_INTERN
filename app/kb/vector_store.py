import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
import logging
from app.config import CHROMA_DB_DIR, DEFAULT_TOP_K
from app.kb.embedder import embedding_provider

logger = logging.getLogger(__name__)

class VectorStoreManager:
    """
    Manages persistent vector indexing and semantic retrieval in ChromaDB.
    """
    def __init__(self, collection_name: str = "reference_knowledge_base"):
        self.collection_name = collection_name
        self.client = chromadb.PersistentClient(path=str(CHROMA_DB_DIR))
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}
        )

    def add_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        if not chunks:
            return 0

        ids = [chunk["chunk_id"] for chunk in chunks]
        documents = [chunk["text"] for chunk in chunks]
        metadatas = []
        
        for chunk in chunks:
            meta = chunk.get("metadata", {}).copy()
            meta["source_id"] = chunk.get("source_id", "")
            meta["chunk_index"] = chunk.get("chunk_index", 0)
            # Ensure ChromaDB metadata values are primitive types
            clean_meta = {}
            for k, v in meta.items():
                if isinstance(v, (str, int, float, bool)):
                    clean_meta[k] = v
                elif v is not None:
                    clean_meta[k] = str(v)
            metadatas.append(clean_meta)

        embeddings = embedding_provider.embed_texts(documents)

        # Upsert into collection
        self.collection.upsert(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

        logger.info(f"Successfully indexed {len(chunks)} chunks in vector store collection '{self.collection_name}'.")
        return len(chunks)

    def search(self, query: str, top_k: int = DEFAULT_TOP_K, dataset_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        if not query or not query.strip():
            return []

        query_embedding = embedding_provider.embed_query(query)
        where_clause = {"dataset": dataset_filter} if dataset_filter else None

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where_clause
        )

        formatted_results = []
        if results and results.get("ids") and results["ids"][0]:
            ids = results["ids"][0]
            docs = results["documents"][0]
            metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(ids)
            distances = results["distances"][0] if results.get("distances") else [0.0] * len(ids)

            for i in range(len(ids)):
                # Convert cosine distance to similarity score
                dist = distances[i]
                sim_score = max(0.0, 1.0 - dist)
                
                formatted_results.append({
                    "chunk_id": ids[i],
                    "text": docs[i],
                    "score": round(sim_score, 4),
                    "dataset": metas[i].get("dataset", "custom"),
                    "source_id": metas[i].get("source_id", ""),
                    "metadata": metas[i]
                })

        return formatted_results

    def get_stats(self) -> Dict[str, Any]:
        count = self.collection.count()
        # Sample metadata to compute dataset breakdown
        datasets_count = {}
        if count > 0:
            sample = self.collection.get(limit=min(count, 500), include=["metadatas"])
            if sample and sample.get("metadatas"):
                for m in sample["metadatas"]:
                    ds = m.get("dataset", "unknown") if m else "unknown"
                    datasets_count[ds] = datasets_count.get(ds, 0) + 1

        return {
            "total_chunks": count,
            "datasets_indexed": datasets_count,
            "status": "ready"
        }

# Singleton Instance
vector_store = VectorStoreManager()
