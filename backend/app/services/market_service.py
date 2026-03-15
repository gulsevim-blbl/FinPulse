import time
import requests
import logging
from app.services.okx_service import okx_service

logger = logging.getLogger(__name__)

COINGECKO_MARKETS_URL = "https://api.coingecko.com/api/v3/coins/markets"

# Basit bir cache mekanizması (Hafızada 30 saniye saklar)
_market_cache = {}

def get_market_coins(vs_currency: str = "usd", per_page: int = 10, page: int = 1):
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
        response = requests.get(COINGECKO_MARKETS_URL, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        _market_cache[cache_key] = (data, current_time + 30) # 30 saniye cache
        return data
    except Exception as e:
        # Hata durumunda (429 gibi) cache'te eski veri varsa onu dön, yoksa boş liste
        if cache_key in _market_cache:
            return _market_cache[cache_key][0]
        return []


def get_coin_price_by_symbol(symbol: str, vs_currency: str = "usd") -> float | None:
    symbol = symbol.lower()
    
    # 1. Önce OKX servisindeki canlı fiyatlara bakalım (Hızlı ve Rate Limit yok)
    lookup_symbol = symbol if vs_currency.lower() == "usd" else f"{symbol}try"
    
    if lookup_symbol in okx_service.prices:
        return okx_service.prices[lookup_symbol]["current_price"]

    # 2. Eğer OKX'te yoksa CoinGecko'ya mecburen soracağız (ama önbellekten dönecektir)
    try:
        coins = get_market_coins(vs_currency=vs_currency, per_page=100, page=1)
        for coin in coins:
            if coin["symbol"].lower() == symbol:
                return coin["current_price"]
    except:
        pass

    return None

_details_cache = {}

def get_coin_details(coin_id: str):
    cache_key = f"details_{coin_id}"
    current_time = time.time()
    
    if cache_key in _details_cache:
        data, expiry = _details_cache[cache_key]
        if current_time < expiry:
            return data

    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}"
    params = {
        "localization": False,
        "tickers": False,
        "market_data": True,
        "community_data": False,
        "developer_data": False,
        "sparkline": "true"
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 429:
            logger.warning(f"CoinGecko Rate Limit reached for {coin_id}")
            if cache_key in _details_cache:
                return _details_cache[cache_key][0]
            return None
            
        response.raise_for_status()
        data = response.json()
        
        # Manual fallback for Bitcoin TR description if missing from API
        if coin_id == "bitcoin" and "description" in data:
            if not data["description"].get("tr"):
                data["description"]["tr"] = (
                    "Bitcoin (BTC), 2009 yılında Satoshi Nakamoto takma ismini kullanan anonim bir kişi veya grup tarafından "
                    "piyasaya sürülen dünyanın ilk merkeziyetsiz kripto para birimidir. Bitcoin, herhangi bir merkez bankasına "
                    "veya tek bir yöneticiye ihtiyaç duymadan, kullanıcıdan kullanıcıya (peer-to-peer) Bitcoin ağında doğrudan "
                    "aktarılabilen dijital bir varlıktır. İşlemler, kriptografi yoluyla ağ düğümleri tarafından doğrulanır ve "
                    "blok zinciri adı verilen halka açık bir dağıtık deftere kaydedilir. Arzı 21 milyon ile sınırlandırılmış "
                    "olan Bitcoin, 'dijital altın' olarak da adlandırılır ve güvenli bir liman varlığı olarak görülür."
                )
        
        # Details cache for 1 minute
        _details_cache[cache_key] = (data, current_time + 60)
        return data
    except Exception as e:
        logger.error(f"Error fetching coin details for {coin_id}: {e}")
        if cache_key in _details_cache:
            return _details_cache[cache_key][0]
        return None