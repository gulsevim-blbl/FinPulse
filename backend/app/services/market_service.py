import requests

COINGECKO_MARKETS_URL = "https://api.coingecko.com/api/v3/coins/markets"


def get_market_coins(vs_currency: str = "usd", per_page: int = 10, page: int = 1):
    params = {
        "vs_currency": vs_currency,
        "order": "market_cap_desc",
        "per_page": per_page,
        "page": page,
        "sparkline": False,
    }

    response = requests.get(COINGECKO_MARKETS_URL, params=params, timeout=10)
    response.raise_for_status()

    return response.json()


def get_coin_price_by_symbol(symbol: str, vs_currency: str = "usd") -> float | None:
    coins = get_market_coins(vs_currency=vs_currency, per_page=100, page=1)

    symbol = symbol.lower()

    for coin in coins:
        if coin["symbol"].lower() == symbol:
            return coin["current_price"]

    return None