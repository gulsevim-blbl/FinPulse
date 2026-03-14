import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.market_service import get_market_coins

router = APIRouter()


@router.websocket("/ws/prices")
async def websocket_prices(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            coins = get_market_coins(vs_currency="usd", per_page=5, page=1)

            simplified_data = [
                {
                    "symbol": coin["symbol"],
                    "name": coin["name"],
                    "current_price": coin["current_price"],
                    "price_change_percentage_24h": coin["price_change_percentage_24h"],
                }
                for coin in coins
            ]

            await websocket.send_json({
                "type": "price_update",
                "data": simplified_data
            })

            await asyncio.sleep(5)

    except WebSocketDisconnect:
        print("WebSocket client disconnected")