from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.domain.repositories.alert_repository import IAlertRepository
from app.models.alert import Alert

class SQLAlchemyAlertRepository(IAlertRepository):
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, symbol: str, target_price: float, condition_type: str) -> Alert:
        alert = Alert(
            symbol=symbol,
            target_price=target_price,
            condition_type=condition_type,
            user_id=user_id,
            is_active=True
        )
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        return alert

    def get_by_user(self, user_id: int) -> List[Alert]:
        return self.db.query(Alert).filter(Alert.user_id == user_id).all()

    def get_active(self) -> List[Alert]:
        # Joined load user to avoid N+1 for emails later
        return self.db.query(Alert).filter(Alert.is_active == True).options(joinedload(Alert.user)).all()

    def get_by_id(self, alert_id: int, user_id: int) -> Optional[Alert]:
        return self.db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == user_id).first()

    def delete(self, alert_id: int, user_id: int) -> Alert:
        alert = self.get_by_id(alert_id, user_id)
        if alert:
            self.db.delete(alert)
            self.db.commit()
        return alert

    def update(self, alert: Alert) -> Alert:
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        return alert
