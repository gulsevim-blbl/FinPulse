import requests

def test_localization(coin_id):
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}"
    params = {
        "localization": "true", # String or bool depending on requests, usually "true"
        "tickers": False,
        "market_data": False,
        "community_data": False,
        "developer_data": False,
        "sparkline": False
    }
    response = requests.get(url, params=params)
    data = response.json()
    desc = data.get("description", {})
    tr_desc = desc.get("tr", "")
    print(f"{coin_id} TR Length with localization=true: {len(tr_desc)}")
    if tr_desc:
        print(f"Start: {tr_desc[:100]}")

test_localization("bitcoin")
