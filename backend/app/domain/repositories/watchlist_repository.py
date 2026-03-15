from abc import ABC, abstractmethod
from typing import List, Any, Optional

class IWatchlistRepository(ABC):
    @abstractmethod
    def create(self, user_id: int, symbol: str) -> Any:
        pass

    @abstractmethod
    def get_by_user_and_symbol(self, user_id: int, symbol: str) -> Optional[Any]:
        pass

    @abstractmethod
    def get_user_items(self, user_id: int) -> List[Any]:
        pass

    @abstractmethod
    def delete(self, item_id: int, user_id: int) -> Any:
        pass
