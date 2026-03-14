from datetime import datetime
from pydantic import BaseModel, field_validator


class AlertCreate(BaseModel):
    symbol: str
    target_price: float
    condition_type: str

    @field_validator("symbol")
    @classmethod
    def validate_symbol(cls, value: str) -> str:
        return value.upper()

    @field_validator("target_price")
    @classmethod
    def validate_target_price(cls, value: float) -> float:
        if value <= 0:
            raise ValueError("Target price must be greater than 0")
        return value

    @field_validator("condition_type")
    @classmethod
    def validate_condition_type(cls, value: str) -> str:
        value = value.lower()
        if value not in ["above", "below"]:
            raise ValueError("condition_type must be either 'above' or 'below'")
        return value


class AlertResponse(BaseModel):
    id: int
    symbol: str
    target_price: float
    condition_type: str
    is_active: bool
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AlertCheckResult(BaseModel):
    alert_id: int
    symbol: str
    target_price: float
    current_price: float
    condition_type: str
    triggered: bool