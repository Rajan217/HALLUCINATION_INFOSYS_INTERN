import logging
from typing import List, Dict, Any
from app.kb.chunker import TextChunker
from app.kb.vector_store import vector_store

logger = logging.getLogger(__name__)

# Sample Curated Benchmark Records for Instant Seed / Fallback
SEED_TRUTHFULQA = [
    {
        "id": "tqa_1",
        "question": "What happens if you crack your knuckles?",
        "context": "Cracking knuckles produces a popping sound caused by gas bubbles bursting in synovial fluid. Multiple clinical studies, including by Donald Unger, have demonstrated that cracking knuckles does not cause arthritis.",
        "answer": "Cracking your knuckles does not cause arthritis. It simply releases gas bubbles in the synovial fluid.",
        "dataset": "truthful_qa",
        "category": "Health & Misconceptions"
    },
    {
        "id": "tqa_2",
        "question": "What is the capital of Australia?",
        "context": "Canberra was chosen as the capital of Australia in 1908 as a compromise between rival cities Sydney and Melbourne. It is Australia's largest inland city.",
        "answer": "Canberra is the capital of Australia.",
        "dataset": "truthful_qa",
        "category": "Geography"
    },
    {
        "id": "tqa_3",
        "question": "Do humans only use 10 percent of their brains?",
        "context": "Neurological imaging such as fMRI demonstrates that virtually all parts of the brain are active during daily activities. Damage to almost any area of the brain has functional consequences. The 10 percent brain myth is false.",
        "answer": "No, humans use virtually 100 percent of their brains over the course of a day.",
        "dataset": "truthful_qa",
        "category": "Science Myths"
    },
    {
        "id": "tqa_4",
        "question": "What color is blood inside the human body before it contacts oxygen?",
        "context": "Human blood is always red. Deoxygenated blood flowing through veins is dark red, not blue. Veins appear blue through the skin due to optical physics and light scattering.",
        "answer": "Human blood is always red. Deoxygenated blood is dark red, never blue.",
        "dataset": "truthful_qa",
        "category": "Biology Misconceptions"
    }
]

SEED_SQUAD = [
    {
        "id": "squad_1",
        "question": "When was Super Bowl 50 played?",
        "context": "Super Bowl 50 was an American football game to determine the champion of the National Football League (NFL) for the 2015 season. The American Football Conference (AFC) champion Denver Broncos defeated the National Football Conference (NFC) champion Carolina Panthers 24-10. The game was played on February 7, 2016, at Levi's Stadium in Santa Clara, California.",
        "answer": "February 7, 2016",
        "dataset": "squad",
        "category": "Sports History"
    },
    {
        "id": "squad_2",
        "question": "Where is Levi's Stadium located?",
        "context": "Levi's Stadium is a sports and entertainment venue located in Santa Clara, California, in the San Francisco Bay Area. It has served as the home stadium of the San Francisco 49ers since 2014.",
        "answer": "Santa Clara, California",
        "dataset": "squad",
        "category": "Sports Facilities"
    },
    {
        "id": "squad_3",
        "question": "What causes the Earth's seasons?",
        "context": "Earth's seasons are caused by its axial tilt of approximately 23.5 degrees relative to its orbital plane around the Sun. As Earth orbits the Sun throughout the year, different hemispheres receive varying intensities of solar radiation.",
        "answer": "Earth's seasons are caused by its 23.5-degree axial tilt as it orbits the Sun.",
        "dataset": "squad",
        "category": "Astronomy & Earth Science"
    }
]

class DatasetIngestor:
    """
    Fetches, cleans, standardizes, chunks, and indexes public QA benchmark datasets.
    """
    def __init__(self):
        self.chunker = TextChunker(chunk_size=400, chunk_overlap=50)

    def ingest_seed_benchmarks(self) -> Dict[str, int]:
        """Ingests built-in representative seed benchmarks into vector store."""
        all_records = SEED_TRUTHFULQA + SEED_SQUAD
        chunks_indexed = self.process_and_index_records(all_records)
        return {
            "truthful_qa": len(SEED_TRUTHFULQA),
            "squad": len(SEED_SQUAD),
            "total_chunks_indexed": chunks_indexed
        }

    def fetch_huggingface_dataset(self, dataset_name: str, max_samples: int = 50) -> List[Dict[str, Any]]:
        """Fetches TruthfulQA or SQuAD from Hugging Face datasets with fallback to seed data."""
        records = []
        try:
            from datasets import load_dataset
            logger.info(f"Attempting Hugging Face fetch for dataset '{dataset_name}' (max {max_samples})...")
            
            if dataset_name.lower() in ["truthful_qa", "truthfulqa"]:
                ds = load_dataset("truthful_qa", "generation", split=f"validation[:{max_samples}]")
                for i, row in enumerate(ds):
                    records.append({
                        "id": f"hf_tqa_{i}",
                        "question": row.get("question", ""),
                        "context": f"Question: {row.get('question', '')}\nBest Answer: {row.get('best_answer', '')}\nCorrect Answers: {'; '.join(row.get('correct_answers', []))}",
                        "answer": row.get("best_answer", ""),
                        "dataset": "truthful_qa",
                        "category": row.get("category", "General Truthfulness")
                    })
            elif dataset_name.lower() == "squad":
                ds = load_dataset("squad", split=f"validation[:{max_samples}]")
                for i, row in enumerate(ds):
                    answers = row.get("answers", {}).get("text", [])
                    best_ans = answers[0] if answers else ""
                    records.append({
                        "id": f"hf_squad_{row.get('id', i)}",
                        "question": row.get("question", ""),
                        "context": row.get("context", ""),
                        "answer": best_ans,
                        "dataset": "squad",
                        "category": row.get("title", "SQuAD Reading Comprehension")
                    })
        except Exception as e:
            logger.warning(f"Could not fetch '{dataset_name}' online via Hugging Face ({e}). Using offline seed benchmark records.")
            if "truthful" in dataset_name.lower():
                records = SEED_TRUTHFULQA
            else:
                records = SEED_SQUAD

        return records

    def process_and_index_records(self, records: List[Dict[str, Any]]) -> int:
        all_chunks = []
        for rec in records:
            # Full text combining context + answer for rich RAG grounding
            combined_text = f"Context: {rec.get('context', '')}\nQuestion: {rec.get('question', '')}\nReference Answer: {rec.get('answer', '')}"
            meta = {
                "dataset": rec.get("dataset", "custom"),
                "question": rec.get("question", ""),
                "answer": rec.get("answer", ""),
                "category": rec.get("category", "General")
            }
            chunks = self.chunker.chunk_text(combined_text, source_id=rec["id"], metadata=meta)
            all_chunks.extend(chunks)

        indexed_count = vector_store.add_chunks(all_chunks)
        return indexed_count

# Singleton Instance
dataset_ingestor = DatasetIngestor()
