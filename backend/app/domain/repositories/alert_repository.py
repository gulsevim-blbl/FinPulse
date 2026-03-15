from abc import ABC, abstractmethod
from typing import List, Any, Optional

class IAlertRepository(ABC):
    @abstractmethod
    def create(self, user_id: int, symbol: str, target_price: float, condition_type: str) -> Any:
        pass

    @abstractmethod
    def get_by_user(self, user_id: int) -> List[Any]:
        pass

    @abstractmethod
    def get_active(self) -> List[Any]:
        pass

    @abstractmethod
    def get_by_id(self, alert_id: int, user_id: int) -> Optional[Any]:
        pass

    @abstractmethod
    def delete(self, alert_id: int, user_id: int) -> Any:
        pass

    @abstractmethod
    def update(self, alert: Any) -> Any:
        pass
