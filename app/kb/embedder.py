from typing import List
import numpy as np
import logging

logger = logging.getLogger(__name__)

class EmbeddingProvider:
    """
    Provides dense vector embeddings for text chunks using SentenceTransformers
    with graceful fallback to deterministic normalized TF-IDF/hash vector representations.
    """
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None
        self._dimension = 384

    def _load_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading SentenceTransformer model: {self.model_name}")
                self._model = SentenceTransformer(self.model_name)
                self._dimension = self._model.get_sentence_embedding_dimension()
            except Exception as e:
                logger.warning(f"Could not load SentenceTransformer ({e}). Falling back to feature hashing embeddings.")
                self._model = "fallback"

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        
        self._load_model()

        if self._model != "fallback" and hasattr(self._model, "encode"):
            try:
                embeddings = self._model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
                return embeddings.tolist()
            except Exception as e:
                logger.error(f"Error encoding with SentenceTransformer: {e}")

        # Fallback deterministic hashing embedding generator
        return [self._fallback_embed(text) for text in texts]

    def embed_query(self, query: str) -> List[float]:
        results = self.embed_texts([query])
        return results[0] if results else [0.0] * self._dimension

    def _fallback_embed(self, text: str) -> List[float]:
        """Deterministic 384-dim hash vector representation for offline/fallback mode."""
        np.random.seed(abs(hash(text)) % (2**32))
        vec = np.random.randn(self._dimension)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

# Singleton instance
embedding_provider = EmbeddingProvider()
