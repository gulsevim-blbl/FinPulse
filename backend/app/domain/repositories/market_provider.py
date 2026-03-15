from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class IMarketProvider(ABC):
    @abstractmethod
    def get_coins_list(self, vs_currency: str, per_page: int, page: int) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_coin_details(self, coin_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_price(self, symbol: str, vs_currency: str) -> Optional[float]:
        pass
