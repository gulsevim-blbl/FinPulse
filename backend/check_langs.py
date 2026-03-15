import requests
import json

def check_langs(coin_id):
    try:
        url = f"https://api.coingecko.com/api/v3/coins/{coin_id}"
        params = {
            "localization": False,
            "tickers": False,
            "market_data": False,
            "community_data": False,
            "developer_data": False,
            "sparkline": False
        }
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        desc = data.get("description", {})
        available_langs = [lang for lang, text in desc.items() if text]
        print(f"Coin: {coin_id}")
        print(f"Available description languages: {available_langs}")
        if "tr" in desc and desc["tr"]:
            print(f"TR length: {len(desc['tr'])}")
            print(f"First 100 chars: {desc['tr'][:100]}")
        else:
            print("TR description missing or empty")
        print("-" * 20)
    except Exception as e:
        print(f"Error checking {coin_id}: {e}")

check_langs("bitcoin")
check_langs("ethereum")
