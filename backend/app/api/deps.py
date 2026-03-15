from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import decode_access_token

# Repositories
from app.infrastructure.market.coingecko_provider import CoinGeckoProvider
from app.infrastructure.market.okx_provider import OKXMarketProvider
from app.infrastructure.repositories.sqlalchemy_portfolio_repository import SQLAlchemyPortfolioRepository
from app.infrastructure.repositories.sqlalchemy_watchlist_repository import SQLAlchemyWatchlistRepository
from app.infrastructure.repositories.sqlalchemy_user_repository import SQLAlchemyUserRepository
from app.infrastructure.repositories.sqlalchemy_alert_repository import SQLAlchemyAlertRepository
from app.infrastructure.repositories.sqlalchemy_notification_repository import SQLAlchemyNotificationRepository

# Services
from app.services.market_service import MarketService
from app.services.portfolio_service import PortfolioService
from app.services.watchlist_service import WatchlistService
from app.services.auth_service import AuthService
from app.services.alert_service import AlertService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    email = payload.get("sub")
    if not email:
        raise credentials_exception

    auth_service = get_auth_service(db)
    user = auth_service.get_user_by_email(email)
    if not user:
        raise credentials_exception

    return user

def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    repo = SQLAlchemyUserRepository(db)
    return AuthService(repo)

def get_market_service() -> MarketService:
    providers = [OKXMarketProvider(), CoinGeckoProvider()]
    return MarketService(providers)

def get_portfolio_service(
    db: Session = Depends(get_db),
    market_service: MarketService = Depends(get_market_service)
) -> PortfolioService:
    repo = SQLAlchemyPortfolioRepository(db)
    return PortfolioService(repo, market_service)

def get_watchlist_service(db: Session = Depends(get_db)) -> WatchlistService:
    repo = SQLAlchemyWatchlistRepository(db)
    return WatchlistService(repo)

def get_alert_service(
    db: Session = Depends(get_db),
    market_service: MarketService = Depends(get_market_service)
) -> AlertService:
    repo = SQLAlchemyAlertRepository(db)
    return AlertService(repo, market_service)

def get_notification_repo(db: Session = Depends(get_db)) -> SQLAlchemyNotificationRepository:
    return SQLAlchemyNotificationRepository(db)