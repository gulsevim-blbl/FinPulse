import requests
import time
import logging
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from typing import List, Dict, Any, Optional
from app.domain.repositories.market_provider import IMarketProvider

logger = logging.getLogger(__name__)


def _build_session() -> requests.Session:
    """Build a reusable requests session with retry strategy."""
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=["GET"],
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update({
        "Accept": "application/json",
        "User-Agent": "FinPulse/1.0",
    })
    return session


# Module-level shared session (NOT per-request)
_session = _build_session()

# Module-level shared caches (persist across requests)
_market_cache: Dict[str, Any] = {}
_details_cache: Dict[str, Any] = {}

MARKET_CACHE_TTL = 60       # 1 minute
DETAILS_CACHE_TTL = 300     # 5 minutes


class CoinGeckoProvider(IMarketProvider):
    BASE_URL = "https://api.coingecko.com/api/v3"

    def get_coins_list(self, vs_currency: str, per_page: int, page: int) -> List[Dict[str, Any]]:
        cache_key = f"{vs_currency}_{per_page}_{page}"
        current_time = time.time()

        if cache_key in _market_cache:
            data, expiry = _market_cache[cache_key]
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
            response = _session.get(f"{self.BASE_URL}/coins/markets", params=params, timeout=10)
            if response.status_code == 429:
                logger.warning("CoinGecko rate limit on coins/markets")
                return _market_cache.get(cache_key, ([], 0))[0]
            response.raise_for_status()
            data = response.json()
            _market_cache[cache_key] = (data, current_time + MARKET_CACHE_TTL)
            return data
        except Exception as e:
            logger.error("CoinGecko get_coins_list error: %s", e)
            return _market_cache.get(cache_key, ([], 0))[0]

    def get_coin_details(self, coin_id: str) -> Optional[Dict[str, Any]]:
        cache_key = f"details_{coin_id}"
        current_time = time.time()

        # Return cached version if still fresh
        if cache_key in _details_cache:
            data, expiry = _details_cache[cache_key]
            if current_time < expiry:
                logger.debug("Cache hit for coin_id=%s", coin_id)
                return data

        params = {
            "localization": "false",
            "tickers": "false",
            "market_data": "true",
            "community_data": "false",
            "developer_data": "false",
            "sparkline": "true",
        }

        try:
            response = _session.get(
                f"{self.BASE_URL}/coins/{coin_id}",
                params=params,
                timeout=15,
            )

            if response.status_code == 429:
                logger.warning("CoinGecko rate limit hit for coin_id=%s – using stale cache", coin_id)
                if cache_key in _details_cache:
                    data, _ = _details_cache[cache_key]
                    # Extend stale TTL by 2 more minutes
                    _details_cache[cache_key] = (data, current_time + 120)
                    return data
                return None

            if response.status_code == 404:
                logger.warning("CoinGecko: coin not found coin_id=%s", coin_id)
                return None

            response.raise_for_status()
            data = response.json()
            _details_cache[cache_key] = (data, current_time + DETAILS_CACHE_TTL)
            logger.info("CoinGecko: fetched details for coin_id=%s", coin_id)
            return data

        except Exception as e:
            logger.error("CoinGecko get_coin_details error for coin_id=%s: %s", coin_id, e)
            # Return stale cache if available (better than nothing)
            if cache_key in _details_cache:
                data, _ = _details_cache[cache_key]
                logger.warning("Returning stale cache for coin_id=%s", coin_id)
                return data
            return None

    def get_price(self, symbol: str, vs_currency: str) -> Optional[float]:
        coins = self.get_coins_list(vs_currency, 100, 1)
        for coin in coins:
            if coin["symbol"].lower() == symbol.lower():
                return coin["current_price"]
        return None
