import asyncio
import logging
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.alert import Alert
from app.models.notification import Notification
from app.services.okx_service import okx_service
from app.services.mail_service import send_alert_email # Yeni HTML şablonlu servis

logger = logging.getLogger(__name__)

class AlertManager:
    def __init__(self):
        self._running = False
        self._task = None

    async def start(self):
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._check_loop())
        logger.info("Alert Manager started")

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
        db: Session = SessionLocal()
        try:
            # JOIN yaparak User bilgisini de alıyoruz ki mail adresine erişebilelim
            active_alerts = db.query(Alert).filter(Alert.is_active == True).all()
            
            for alert in active_alerts:
                price_data = None
                if alert.symbol in okx_service.prices:
                    price_data = okx_service.prices[alert.symbol]
                else:
                    usdt_pair = f"{alert.symbol.upper()}-USDT"
                    if usdt_pair in okx_service.prices:
                        price_data = okx_service.prices[usdt_pair]

                if not price_data:
                    continue

                current_price = price_data["current_price"]
                triggered = False

                if alert.condition_type == "above" and current_price >= alert.target_price:
                    triggered = True
                elif alert.condition_type == "below" and current_price <= alert.target_price:
                    triggered = True

                if triggered:
                    alert.is_active = False
                    
                    # 1. Uygulama İçi Bildirim Oluştur
                    notification = Notification(
                        user_id=alert.user_id,
                        title=f"🚨 Alarm Tetiklendi: {alert.symbol}",
                        message=f"{alert.symbol} fiyatı {alert.target_price} {alert.condition_type} seviyesine ulaştı! Güncel: {current_price}",
                        type="alert"
                    )
                    db.add(notification)
                    
                    # 2. E-posta Gönder (HTML Şablonu ile)
                    if alert.user and alert.user.email:
                        # Mail işlemini arka planda başlat
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
                    
                    logger.info(f"Alert triggered & Email sent task created for user {alert.user_id}: {alert.symbol}")

            db.commit()
        finally:
            db.close()

alert_manager = AlertManager()
