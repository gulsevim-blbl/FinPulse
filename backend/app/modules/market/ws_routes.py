import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.okx_service import okx_service

router = APIRouter()

@router.websocket("/ws/prices")
async def websocket_prices(websocket: WebSocket):
    await websocket.accept()
    
    # OKX güncellemelerine abone ol
    q = okx_service.subscribe()
    
    try:
        # Eğer varsa mevcut fiyatları hemen gönder
        if okx_service.prices:
            await websocket.send_json({
                "type": "price_update",
                "data": list(okx_service.prices.values())
            })

        while True:
            # OKX servisinden yeni güncelleme bekle
            update = await q.get()
            await websocket.send_json(update)
            
    except WebSocketDisconnect:
        okx_service.unsubscribe(q)
    except Exception as e:
        print(f"WebSocket send error: {e}")
        okx_service.unsubscribe(q)