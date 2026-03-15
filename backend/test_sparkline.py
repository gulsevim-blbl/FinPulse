import requests
import json

def test_details(coin_id):
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}"
    params = {
        "localization": False,
        "tickers": False,
        "market_data": True,
        "community_data": False,
        "developer_data": False,
        "sparkline": True
    }
    response = requests.get(url, params=params)
    data = response.json()
    
    has_sparkline = "sparkline_7d" in data.get("market_data", {})
    print(f"Coin: {coin_id}")
    print(f"Has sparkline_7d: {has_sparkline}")
    if has_sparkline:
        prices = data["market_data"]["sparkline_7d"].get("price", [])
        print(f"Sparkline prices count: {len(prices)}")
    else:
        print(f"Market data keys: {list(data.get('market_data', {}).keys())[:10]}")

test_details("bitcoin")
test_details("ethereum")
test_details("solana")
