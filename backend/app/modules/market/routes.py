from fastapi import APIRouter, HTTPException, Query, Depends

from app.api.deps import get_market_service
from app.schemas.market import MarketCoinResponse
from app.services.market_service import MarketService

router = APIRouter(prefix="/market", tags=["Market"])


@router.get("/coins", response_model=list[MarketCoinResponse])
def list_market_coins(
    vs_currency: str = Query(default="usd"),
    per_page: int = Query(default=10, le=50),
    page: int = Query(default=1, ge=1),
    service: MarketService = Depends(get_market_service)
):
    try:
        coins = service.get_market_coins(vs_currency=vs_currency, per_page=per_page, page=page)
        return coins
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch market data: {str(e)}")

@router.get("/coins/{coin_id}")
def get_coin_detail(
    coin_id: str,
    service: MarketService = Depends(get_market_service)
):
    try:
        details = service.get_coin_details(coin_id)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Market data service error: {str(e)}")
    
    if not details:
        raise HTTPException(
            status_code=503,
            detail=f"Could not fetch coin details for '{coin_id}'. CoinGecko API may be rate-limited or unavailable."
        )
    return details