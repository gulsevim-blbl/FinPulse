import secrets
from datetime import datetime, timedelta, timezone
from app.domain.repositories.user_repository import IUserRepository
from app.schemas.user import UserCreate
from app.core.security import hash_password, verify_password

class AuthService:
    def __init__(self, repo: IUserRepository):
        self.repo = repo

    def get_user_by_email(self, email: str):
        return self.repo.get_by_email(email)

    def create_user(self, user_data: UserCreate):
        hashed_pw = hash_password(user_data.password)
        return self.repo.create(
            full_name=user_data.full_name,
            email=user_data.email,
            hashed_password=hashed_pw
        )

    def authenticate_user(self, email: str, password: str):
        user = self.repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    def create_password_reset_token(self, email: str):
        user = self.repo.get_by_email(email)
        if not user:
            return None

        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expiry = datetime.now(timezone.utc) + timedelta(hours=1)
        
        self.repo.update(user)
        return token

    def reset_password(self, token: str, new_password: str):
        user = self.repo.get_by_reset_token(token)
        if not user:
            return False

        user.hashed_password = hash_password(new_password)
        user.reset_token = None
        user.reset_token_expiry = None
        
        self.repo.update(user)
        return True