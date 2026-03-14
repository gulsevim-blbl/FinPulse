from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime


class UserBase(BaseModel):
    full_name: str
    email: EmailStr


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")

        if len(value.encode("utf-8")) > 72:
            raise ValueError(
                "Password is too long for bcrypt. Use maximum 72 bytes and avoid too many special/non-ASCII characters."
            )

        return value


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True