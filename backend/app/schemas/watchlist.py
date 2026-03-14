from datetime import datetime
from pydantic import BaseModel, field_validator


class WatchlistItemCreate(BaseModel):
    symbol: str

    @field_validator("symbol")
    @classmethod
    def validate_symbol(cls, value: str) -> str:
        return value.upper()


class WatchlistItemResponse(BaseModel):
    id: int
    symbol: str
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True