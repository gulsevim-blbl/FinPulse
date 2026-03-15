from abc import ABC, abstractmethod
from typing import List, Any

class IPortfolioRepository(ABC):
    @abstractmethod
    def create(self, user_id: int, symbol: str, quantity: float, average_buy_price: float, current_price: float) -> Any:
        """Yeni bir portföy öğesi oluşturur."""
        pass

    @abstractmethod
    def get_user_items(self, user_id: int) -> List[Any]:
        """Kullanıcının tüm portföy öğelerini getirir."""
        pass

    @abstractmethod
    def get_item(self, item_id: int, user_id: int) -> Any:
        """ID ve kullanıcı ID'sine göre tek bir öğe getirir."""
        pass

    @abstractmethod
    def delete(self, item_id: int, user_id: int) -> Any:
        """Öğeyi siler."""
        pass

    @abstractmethod
    def update_prices(self, user_id: int, symbol_price_map: dict) -> List[str]:
        """Fiyatları toplu günceller."""
        pass
