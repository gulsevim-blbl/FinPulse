from fastapi import APIRouter, HTTPException, Query

from app.schemas.market import MarketCoinResponse
from app.services.market_service import get_market_coins

router = APIRouter(prefix="/market", tags=["Market"])


@router.get("/coins", response_model=list[MarketCoinResponse])
def list_market_coins(
    vs_currency: str = Query(default="usd"),
    per_page: int = Query(default=10, le=50),
    page: int = Query(default=1, ge=1),
):
    try:
        coins = get_market_coins(vs_currency=vs_currency, per_page=per_page, page=page)
        return coins
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch market data: {str(e)}")

@router.get("/coins/{coin_id}")
def get_coin_detail(coin_id: str):
    from app.services.market_service import get_coin_details
    details = get_coin_details(coin_id)
    if not details:
        raise HTTPException(status_code=404, detail="Coin not found")
    return details