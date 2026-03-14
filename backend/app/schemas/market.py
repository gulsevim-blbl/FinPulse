from pydantic import BaseModel


class MarketCoinResponse(BaseModel):
    id: str
    symbol: str
    name: str
    current_price: float
    market_cap: float | None = None
    price_change_percentage_24h: float | None = None
    image: str | None = None