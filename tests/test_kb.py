import unittest
from app.kb.chunker import TextChunker
from app.kb.embedder import embedding_provider
from app.kb.vector_store import vector_store

class TestKnowledgeBase(unittest.TestCase):
    def test_text_chunker(self):
        chunker = TextChunker(chunk_size=50, chunk_overlap=10)
        text = "Sentence one is long enough. Sentence two continues here. Sentence three finishes."
        chunks = chunker.chunk_text(text, source_id="test_doc")
        
        self.assertGreaterThan(len(chunks), 0)
        self.assertIn("text", chunks[0])
        self.assertEqual(chunks[0]["source_id"], "test_doc")

    def assertGreaterThan(self, a, b):
        self.assertTrue(a > b)

    def test_embedding_provider(self):
        texts = ["Knuckle cracking produces gas bubbles.", "Super Bowl 50 was played in 2016."]
        embeddings = embedding_provider.embed_texts(texts)
        
        self.assertEqual(len(embeddings), 2)
        self.assertEqual(len(embeddings[0]), 384)

    def test_vector_store_indexing_and_search(self):
        sample_chunks = [
            {
                "chunk_id": "test_chunk_1",
                "text": "Canberra is the capital city of Australia.",
                "source_id": "tqa_2",
                "chunk_index": 0,
                "metadata": {"dataset": "truthful_qa", "question": "What is the capital of Australia?"}
            },
            {
                "chunk_id": "test_chunk_2",
                "text": "Super Bowl 50 was played on February 7, 2016 at Levi's Stadium.",
                "source_id": "squad_1",
                "chunk_index": 0,
                "metadata": {"dataset": "squad", "question": "When was Super Bowl 50 played?"}
            }
        ]

        indexed_count = vector_store.add_chunks(sample_chunks)
        self.assertEqual(indexed_count, 2)

        # Semantic Retrieval Test
        results = vector_store.search("Where is the capital of Australia?", top_k=1)
        self.assertTrue(len(results) >= 1)
        self.assertIn("Canberra", results[0]["text"])

if __name__ == "__main__":
    unittest.main()
