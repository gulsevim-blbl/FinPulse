import requests

def check_one(coin_id):
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}"
    params = {"localization": False}
    data = requests.get(url, params=params).json()
    tr = data.get("description", {}).get("tr", "")
    print(f"{coin_id} TR length: {len(tr)}")
    print(f"{coin_id} TR start: {repr(tr[:50])}")

check_one("bitcoin")
check_one("ethereum")
