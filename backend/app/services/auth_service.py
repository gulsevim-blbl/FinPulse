from sqlalchemy.orm import Session
import secrets
from datetime import datetime, timedelta, timezone

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password, verify_password


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_data: UserCreate):
    hashed_pw = hash_password(user_data.password)

    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hashed_pw,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user


def create_password_reset_token(db: Session, email: str):
    user = get_user_by_email(db, email)
    if not user:
        return None

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    # Token 1 saat geçerli olsun
    user.reset_token_expiry = datetime.now(timezone.utc) + timedelta(hours=1)
    
    db.commit()
    return token


def reset_password(db: Session, token: str, new_password: str):
    user = db.query(User).filter(
        User.reset_token == token,
        User.reset_token_expiry > datetime.now(timezone.utc)
    ).first()

    if not user:
        return False

    user.hashed_password = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    
    db.commit()
    return True