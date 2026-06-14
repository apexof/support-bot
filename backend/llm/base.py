from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator


class LLMProvider(ABC):
    @abstractmethod
    def stream(
        self,
        messages: list[dict],
        system: str = "",
    ) -> AsyncGenerator[str, None]: ...
