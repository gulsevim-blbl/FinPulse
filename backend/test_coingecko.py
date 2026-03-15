import requests

url = "https://api.coingecko.com/api/v3/coins/bitcoin"
params = {
    "localization": False,
    "tickers": False,
    "market_data": True,
    "community_data": False,
    "developer_data": False,
    "sparkline": True
}

try:
    print(f"Testing CoinGecko connection for bitcoin...")
    response = requests.get(url, params=params, timeout=10)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Success! Bitcoin details fetched.")
        print(f"Name: {response.json().get('name')}")
    else:
        print(f"Failed. Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
