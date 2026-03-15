from typing import List, Dict, Any, Optional
from app.domain.repositories.market_provider import IMarketProvider
from app.services.okx_service import okx_service

class OKXMarketProvider(IMarketProvider):
    def get_coins_list(self, vs_currency: str, per_page: int, page: int) -> List[Dict[str, Any]]:
        # OKX is handled via WS, but we can return the current state
        currency = vs_currency.upper()
        results = []
        for key, value in okx_service.prices.items():
            if key.endswith(f"-{currency}"):
                results.append(value)
        return results

    def get_coin_details(self, coin_id: str) -> Optional[Dict[str, Any]]:
        # OKX doesn't provide full details like CG, return None to fallback
        return None

    def get_price(self, symbol: str, vs_currency: str) -> Optional[float]:
        symbol = symbol.upper()
        currency = vs_currency.upper()
        lookup_key = f"{symbol}-{currency}"
        
        if lookup_key in okx_service.prices:
            return okx_service.prices[lookup_key]["current_price"]
        
        # Fallback for USDT if looking for stable price
        if symbol == "USDT" and currency == "USD":
            return 1.0
            
        return None
