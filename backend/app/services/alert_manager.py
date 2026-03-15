import asyncio
import logging
from app.db.database import SessionLocal
from app.infrastructure.repositories.sqlalchemy_alert_repository import SQLAlchemyAlertRepository
from app.infrastructure.repositories.sqlalchemy_notification_repository import SQLAlchemyNotificationRepository
from app.infrastructure.market.okx_provider import OKXMarketProvider
from app.infrastructure.market.coingecko_provider import CoinGeckoProvider
from app.services.market_service import MarketService
from app.services.mail_service import send_alert_email

logger = logging.getLogger(__name__)

class AlertManager:
    def __init__(self):
        self._running = False
        self._task = None
        # Infrastructure components
        self.market_service = MarketService([OKXMarketProvider(), CoinGeckoProvider()])

    async def start(self):
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._check_loop())
        logger.info("Alert Manager started (Clean Architecture)")

    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Alert Manager stopped")

    async def _check_loop(self):
        while self._running:
            try:
                await self.check_all_alerts()
            except Exception as e:
                logger.error(f"Error in alert check loop: {e}")
            
            await asyncio.sleep(10)

    async def check_all_alerts(self):
        db = SessionLocal()
        try:
            alert_repo = SQLAlchemyAlertRepository(db)
            notif_repo = SQLAlchemyNotificationRepository(db)
            
            active_alerts = alert_repo.get_active()
            
            for alert in active_alerts:
                current_price = self.market_service.get_coin_price_by_symbol(alert.symbol)
                
                if current_price is None:
                    continue

                triggered = False
                if alert.condition_type == "above" and current_price >= alert.target_price:
                    triggered = True
                elif alert.condition_type == "below" and current_price <= alert.target_price:
                    triggered = True

                if triggered:
                    alert.is_active = False
                    alert_repo.update(alert)
                    
                    # 1. Create Notification
                    notif_repo.create(
                        user_id=alert.user_id,
                        title=f"🚨 Alarm Tetiklendi: {alert.symbol}",
                        message=f"{alert.symbol} fiyatı {alert.target_price} {alert.condition_type} seviyesine ulaştı! Güncel: {current_price}",
                        type="alert"
                    )
                    
                    # 2. Send Email
                    if alert.user and alert.user.email:
                        asyncio.create_task(
                            send_alert_email(
                                email_to=alert.user.email,
                                user_name=alert.user.full_name,
                                symbol=alert.symbol,
                                target_price=alert.target_price,
                                current_price=current_price,
                                condition=alert.condition_type
                            )
                        )
                    
                    logger.info(f"Alert triggered for user {alert.user_id}: {alert.symbol}")

            db.commit()
        finally:
            db.close()

alert_manager = AlertManager()
