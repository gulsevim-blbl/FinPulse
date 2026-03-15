from datetime import datetime
from pydantic import BaseModel, field_validator


class PortfolioItemCreate(BaseModel):
    symbol: str
    quantity: float
    average_buy_price: float

    @field_validator("symbol")
    @classmethod
    def validate_symbol(cls, value: str) -> str:
        return value.upper()

    @field_validator("quantity", "average_buy_price")
    @classmethod
    def validate_positive_numbers(cls, value: float) -> float:
        if value <= 0:
            raise ValueError("Value must be greater than 0")
        return value


class PortfolioItemResponse(PortfolioItemCreate):
    id: int
    current_price: float
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PortfolioSummary(BaseModel):
    id: int
    symbol: str
    quantity: float
    average_buy_price: float
    current_price: float
    total_cost: float
    current_value: float
    profit_loss: float

    class Config:
        from_attributes = True


class PortfolioItemListResponse(BaseModel):
    items: list[PortfolioSummary]