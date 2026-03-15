import logging
from typing import List, Optional, Dict, Any
from app.domain.repositories.market_provider import IMarketProvider

logger = logging.getLogger(__name__)

class MarketService:
    def __init__(self, providers: List[IMarketProvider]):
        self.providers = providers

    def get_market_coins(self, vs_currency: str = "usd", per_page: int = 10, page: int = 1) -> List[Dict[str, Any]]:
        # CoinGecko focus (or first provider that returns data)
        for provider in self.providers:
            data = provider.get_coins_list(vs_currency, per_page, page)
            if data:
                return data
        return []

    def get_coin_price_by_symbol(self, symbol: str, vs_currency: str = "usd") -> Optional[float]:
        # Try all providers in order
        for provider in self.providers:
            price = provider.get_price(symbol, vs_currency)
            if price is not None:
                return price
        return None

    def get_coin_details(self, coin_id: str) -> Optional[Dict[str, Any]]:
        for provider in self.providers:
            details = provider.get_coin_details(coin_id)
            if details:
                # Add custom logic (moved from original service)
                if coin_id == "bitcoin" and "description" in details:
                    if not details["description"].get("tr"):
                        details["description"]["tr"] = (
                            "Bitcoin (BTC), 2009 yılında Satoshi Nakamoto takma ismini kullanan anonim bir kişi veya grup tarafından "
                            "piyasaya sürülen dünyanın ilk merkeziyetsiz kripto para birimidir. Bitcoin, herhangi bir merkez bankasına "
                            "veya tek bir yöneticiye ihtiyaç duymadan, kullanıcıdan kullanıcıya (peer-to-peer) Bitcoin ağında doğrudan "
                            "aktarılabilen dijital bir varlıktır. İşlemler, kriptografi yoluyla ağ düğümleri tarafından doğrulanır ve "
                            "blok zinciri adı verilen halka açık bir dağıtık deftere kaydedilir. Arzı 21 milyon ile sınırlandırılmış "
                            "olan Bitcoin, 'dijital altın' olarak da adlandırılır ve güvenli bir liman varlığı olarak görülür."
                        )
                return details
        return None