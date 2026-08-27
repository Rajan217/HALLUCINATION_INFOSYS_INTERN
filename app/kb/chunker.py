from typing import List, Dict, Any

class TextChunker:
    """
    Splits source documents into standardized text chunks with overlap
    to preserve boundary context for RAG retrieval.
    """
    def __init__(self, chunk_size: int = 400, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_text(self, text: str, source_id: str = "", metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        if not text or not text.strip():
            return []

        text = text.strip()
        metadata = metadata or {}
        chunks = []

        # If text fits within a single chunk
        if len(text) <= self.chunk_size:
            return [{
                "chunk_id": f"{source_id}_chunk_0",
                "text": text,
                "source_id": source_id,
                "chunk_index": 0,
                "metadata": metadata
            }]

        start = 0
        chunk_idx = 0
        text_length = len(text)

        while start < text_length:
            end = min(start + self.chunk_size, text_length)
            
            # If not at the end of text, try to find a natural sentence boundary (period, newline, question mark)
            if end < text_length:
                boundary = max(
                    text.rfind('. ', start, end),
                    text.rfind('\n', start, end),
                    text.rfind('? ', start, end)
                )
                if boundary != -1 and boundary > start + (self.chunk_size // 2):
                    end = boundary + 1

            chunk_content = text[start:end].strip()
            if chunk_content:
                chunks.append({
                    "chunk_id": f"{source_id}_chunk_{chunk_idx}",
                    "text": chunk_content,
                    "source_id": source_id,
                    "chunk_index": chunk_idx,
                    "metadata": metadata
                })
                chunk_idx += 1

            start = end - self.chunk_overlap if end < text_length else text_length

        return chunks
