import requests

def check_no_params(coin_id):
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}"
    data = requests.get(url).json()
    tr = data.get("description", {}).get("tr", "")
    print(f"{coin_id} TR length (no params): {len(tr)}")

check_no_params("bitcoin")
