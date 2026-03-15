import requests
import time
import logging
from typing import List, Dict, Any, Optional
from app.domain.repositories.market_provider import IMarketProvider

logger = logging.getLogger(__name__)

class CoinGeckoProvider(IMarketProvider):
    BASE_URL = "https://api.coingecko.com/api/v3"
    
    def __init__(self):
        self._market_cache = {}
        self._details_cache = {}

    def get_coins_list(self, vs_currency: str, per_page: int, page: int) -> List[Dict[str, Any]]:
        cache_key = f"{vs_currency}_{per_page}_{page}"
        current_time = time.time()
        
        if cache_key in self._market_cache:
            data, expiry = self._market_cache[cache_key]
            if current_time < expiry:
                return data

        try:
            params = {
                "vs_currency": vs_currency,
                "order": "market_cap_desc",
                "per_page": per_page,
                "page": page,
                "sparkline": False,
            }
            response = requests.get(f"{self.BASE_URL}/coins/markets", params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            self._market_cache[cache_key] = (data, current_time + 30)
            return data
        except Exception:
            return self._market_cache.get(cache_key, ([], 0))[0]

    def get_coin_details(self, coin_id: str) -> Optional[Dict[str, Any]]:
        cache_key = f"details_{coin_id}"
        current_time = time.time()
        
        if cache_key in self._details_cache:
            data, expiry = self._details_cache[cache_key]
            if current_time < expiry:
                return data

        params = {
            "localization": False,
            "tickers": False,
            "market_data": True,
            "community_data": False,
            "developer_data": False,
            "sparkline": True
        }
        
        try:
            response = requests.get(f"{self.BASE_URL}/coins/{coin_id}", params=params, timeout=10)
            if response.status_code == 429:
                return self._details_cache.get(cache_key, (None, 0))[0]
            
            response.raise_for_status()
            data = response.json()
            self._details_cache[cache_key] = (data, current_time + 60)
            return data
        except Exception:
            return self._details_cache.get(cache_key, (None, 0))[0]

    def get_price(self, symbol: str, vs_currency: str) -> Optional[float]:
        # Implementation could be more efficient with simple price endpoint, 
        # but matching existing logic which uses markets list cache
        coins = self.get_coins_list(vs_currency, 100, 1)
        for coin in coins:
            if coin["symbol"].lower() == symbol.lower():
                return coin["current_price"]
        return None
