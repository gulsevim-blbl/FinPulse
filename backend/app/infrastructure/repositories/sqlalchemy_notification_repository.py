from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.repositories.notification_repository import INotificationRepository
from app.models.notification import Notification

class SQLAlchemyNotificationRepository(INotificationRepository):
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, title: str, message: str, type: str) -> Notification:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type
        )
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return notif

    def get_by_user(self, user_id: int) -> List[Notification]:
        return self.db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

    def get_by_id(self, notification_id: int, user_id: int) -> Optional[Notification]:
        return self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()

    def mark_as_read(self, user_id: int) -> int:
        updated = self.db.query(Notification).filter(
            Notification.user_id == user_id, 
            Notification.is_read == False
        ).update({"is_read": True})
        self.db.commit()
        return updated

    def update(self, notification: Notification) -> Notification:
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def delete(self, notification: Notification):
        self.db.delete(notification)
        self.db.commit()
