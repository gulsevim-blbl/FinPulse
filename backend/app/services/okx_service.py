import asyncio
import json
import logging
import websockets
from typing import Dict, List, Set

logger = logging.getLogger(__name__)

class OKXService:
    def __init__(self):
        self.url = "wss://ws.okx.com:8443/ws/v5/public"
        self.inst_ids = [
            "BTC-USDT", "ETH-USDT", "SOL-USDT", "ADA-USDT", "AVAX-USDT", "XRP-USDT", "DOT-USDT",
            "BTC-TRY", "ETH-TRY", "USDT-TRY"
        ]
        self.prices: Dict[str, dict] = {}
        self.subscribers: Set[asyncio.Queue] = set()
        self._running = False
        self._task = None

    async def start(self):
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._run())
        logger.info("OKX Service started")

    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("OKX Service stopped")

    async def _run(self):
        while self._running:
            try:
                async with websockets.connect(self.url) as ws:
                    # Subscribe to tickers
                    subscribe_msg = {
                        "op": "subscribe",
                        "args": [{"channel": "tickers", "instId": inst_id} for inst_id in self.inst_ids]
                    }
                    await ws.send(json.dumps(subscribe_msg))
                    logger.info(f"Subscribed to OKX tickers: {self.inst_ids}")

                    async for message in ws:
                        data = json.loads(message)
                        if "data" in data:
                            for ticker in data["data"]:
                                inst_id = ticker["instId"]
                                base_coin, quote = inst_id.split("-")
                                
                                # Sembol isimlendirmesi: USDT ise sadece coin adı, TRY ise coin+try
                                if quote == "USDT":
                                    symbol = base_coin.lower()
                                else:
                                    symbol = f"{base_coin.lower()}{quote.lower()}"
                                
                                last_price = float(ticker["last"])
                                open_24h = float(ticker["open24h"])
                                change_24h = ((last_price - open_24h) / open_24h) * 100 if open_24h != 0 else 0
                                
                                name_map = {
                                    "btc": "Bitcoin",
                                    "btctry": "Bitcoin (TRY)",
                                    "eth": "Ethereum",
                                    "ethtry": "Ethereum (TRY)",
                                    "sol": "Solana",
                                    "ada": "Cardano",
                                    "avax": "Avalanche",
                                    "xrp": "XRP",
                                    "dot": "Polkadot",
                                    "usdttry": "Tether (TRY)"
                                }

                                self.prices[symbol] = {
                                    "symbol": symbol,
                                    "name": name_map.get(symbol, f"{base_coin} ({quote})"),
                                    "current_price": round(last_price, 2) if last_price > 1 else round(last_price, 6),
                                    "price_change_percentage_24h": round(change_24h, 2)
                                }
                            
                            # Notify subscribers
                            update = {
                                "type": "price_update",
                                "data": list(self.prices.values())
                            }
                            for q in list(self.subscribers):
                                await q.put(update)

            except Exception as e:
                logger.error(f"OKX WebSocket error: {e}")
                if self._running:
                    await asyncio.sleep(5)  # Backoff before reconnect

    def subscribe(self) -> asyncio.Queue:
        q = asyncio.Queue()
        self.subscribers.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue):
        if q in self.subscribers:
            self.subscribers.remove(q)

okx_service = OKXService()
