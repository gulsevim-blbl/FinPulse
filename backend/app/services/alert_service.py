from app.domain.repositories.alert_repository import IAlertRepository
from app.schemas.alert import AlertCreate
from app.services.market_service import MarketService

class AlertService:
    def __init__(self, repo: IAlertRepository, market_service: MarketService):
        self.repo = repo
        self.market_service = market_service

    def create_alert(self, user_id: int, alert_data: AlertCreate):
        return self.repo.create(
            user_id=user_id,
            symbol=alert_data.symbol,
            target_price=alert_data.target_price,
            condition_type=alert_data.condition_type
        )

    def get_user_alerts(self, user_id: int):
        return self.repo.get_by_user(user_id)

    def delete_alert(self, alert_id: int, user_id: int):
        return self.repo.delete(alert_id, user_id)

    def check_user_alerts(self, user_id: int):
        # This function might be redundant if AlertManager is running, 
        # but matching existing functionality
        alerts = self.repo.get_by_user(user_id)
        active_alerts = [a for a in alerts if a.is_active]
        results = []

        for alert in active_alerts:
            current_price = self.market_service.get_coin_price_by_symbol(alert.symbol)
            if current_price is None:
                continue

            triggered = False
            if alert.condition_type == "above" and current_price > alert.target_price:
                triggered = True
            elif alert.condition_type == "below" and current_price < alert.target_price:
                triggered = True

            if triggered:
                alert.is_active = False
                self.repo.update(alert)

            results.append({
                "alert_id": alert.id,
                "symbol": alert.symbol,
                "target_price": alert.target_price,
                "current_price": current_price,
                "condition_type": alert.condition_type,
                "triggered": triggered,
            })

        return results