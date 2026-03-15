import requests

def test_sparkline_str():
    url = "https://api.coingecko.com/api/v3/coins/bitcoin"
    # Try with string "true"
    params = {"sparkline": "true"}
    resp = requests.get(url, params=params).json()
    print(f"With 'true' string - has sparkline_7d: {'sparkline_7d' in resp.get('market_data', {})}")
    
    # Try with markets endpoint as fallback if needed
    url_m = "https://api.coingecko.com/api/v3/coins/markets"
    params_m = {"vs_currency": "usd", "ids": "bitcoin", "sparkline": "true"}
    resp_m = requests.get(url_m, params=params_m).json()
    print(f"Markets endpoint - has sparkline_in_7d: {'sparkline_in_7d' in resp_m[0] if resp_m else 'False'}")

test_sparkline_str()
