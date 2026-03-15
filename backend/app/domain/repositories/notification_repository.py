from abc import ABC, abstractmethod
from typing import List, Any

class INotificationRepository(ABC):
    @abstractmethod
    def create(self, user_id: int, title: str, message: str, type: str) -> Any:
        pass

    @abstractmethod
    def get_by_user(self, user_id: int) -> List[Any]:
        pass

    @abstractmethod
    def mark_as_read(self, user_id: int) -> int:
        pass
