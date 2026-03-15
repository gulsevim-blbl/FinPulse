from abc import ABC, abstractmethod
from typing import Any, Optional

class IUserRepository(ABC):
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[Any]:
        pass

    @abstractmethod
    def get_by_reset_token(self, token: str) -> Optional[Any]:
        pass

    @abstractmethod
    def create(self, full_name: str, email: str, hashed_password: str) -> Any:
        pass

    @abstractmethod
    def update(self, user: Any) -> Any:
        pass

    @abstractmethod
    def commit(self):
        pass
