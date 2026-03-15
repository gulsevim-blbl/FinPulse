import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


from app.services.okx_service import okx_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Uygulama açılırken tabloları oluştur; DB yoksa uyarı ver, uygulama yine de çalışsın."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Veritabanı tabloları hazır.")
    except Exception as e:
        logger.warning("Veritabanı bağlantısı kurulamadı, tablolar oluşturulmadı: %s", e)
    
    # Start OKX Service
    await okx_service.start()
    
    yield
    
    # Stop OKX Service
    await okx_service.stop()


app = FastAPI(
    lifespan=lifespan,
    title=settings.app_name,
    version=settings.app_version
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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