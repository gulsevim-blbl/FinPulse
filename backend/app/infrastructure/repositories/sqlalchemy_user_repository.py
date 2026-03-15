from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.domain.repositories.user_repository import IUserRepository
from app.models.user import User

class SQLAlchemyUserRepository(IUserRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_reset_token(self, token: str) -> Optional[User]:
        return self.db.query(User).filter(
            User.reset_token == token,
            User.reset_token_expiry > datetime.now(timezone.utc)
        ).first()

    def create(self, full_name: str, email: str, hashed_password: str) -> User:
        user = User(
            full_name=full_name,
            email=email,
            hashed_password=hashed_password,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def commit(self):
        self.db.commit()
