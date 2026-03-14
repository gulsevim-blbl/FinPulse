import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import settings
from app.db.database import Base, engine
from app.models import User
from app.modules.auth.routes import router as auth_router
from app.modules.portfolio.routes import router as portfolio_router
from app.modules.market.routes import router as market_router
from app.modules.watchlist.routes import router as watchlist_router
from app.modules.alerts.routes import router as alerts_router
from app.modules.market.ws_routes import router as market_ws_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Uygulama açılırken tabloları oluştur; DB yoksa uyarı ver, uygulama yine de çalışsın."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Veritabanı tabloları hazır.")
    except Exception as e:
        logger.warning("Veritabanı bağlantısı kurulamadı, tablolar oluşturulmadı: %s", e)
    yield
    # shutdown: gerekirse engine dispose vb.


app = FastAPI(
    lifespan=lifespan,
    title=settings.app_name,
    version=settings.app_version
)

app.include_router(auth_router)
app.include_router(portfolio_router)
app.include_router(market_router)
app.include_router(watchlist_router)
app.include_router(alerts_router)
app.include_router(market_ws_router)



@app.get("/")
def read_root():
    return {
        "message": f"{settings.app_name} backend is running",
        "version": settings.app_version
    }