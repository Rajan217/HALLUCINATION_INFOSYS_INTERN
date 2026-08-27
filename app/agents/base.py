from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from app.models.schema import AgentDimensionScore

class BaseJudgeAgent(ABC):
    """
    Abstract Base Class for specialized AI Judge Agents in the evaluation framework.
    """
    def __init__(self, name: str, weight: float):
        self.name = name
        self.weight = weight

    @abstractmethod
    def evaluate(
        self,
        question: str,
        ai_response: str,
        reference_answer: Optional[str] = None,
        source_document: Optional[str] = None
    ) -> AgentDimensionScore:
        """
        Executes evaluation for the designated dimension.
        Returns an AgentDimensionScore containing a score (0.0-100.0), reasoning, and metadata.
        """
        pass
