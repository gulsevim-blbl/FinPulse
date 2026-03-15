from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.api.deps import get_current_user, get_notification_repo
from app.schemas.notification import NotificationResponse
from app.infrastructure.repositories.sqlalchemy_notification_repository import SQLAlchemyNotificationRepository

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def list_notifications(
    repo: SQLAlchemyNotificationRepository = Depends(get_notification_repo),
    current_user = Depends(get_current_user)
):
    return repo.get_by_user(current_user.id)

@router.post("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    repo: SQLAlchemyNotificationRepository = Depends(get_notification_repo),
    current_user = Depends(get_current_user)
):
    notif = repo.get_by_id(notification_id, current_user.id)
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    repo.update(notif)
    return {"message": "Marked as read"}

@router.post("/read-all")
def mark_all_as_read(
    repo: SQLAlchemyNotificationRepository = Depends(get_notification_repo),
    current_user = Depends(get_current_user)
):
    repo.mark_as_read(current_user.id)
    return {"message": "All marked as read"}

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    repo: SQLAlchemyNotificationRepository = Depends(get_notification_repo),
    current_user = Depends(get_current_user)
):
    notif = repo.get_by_id(notification_id, current_user.id)
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    repo.delete(notif)
    return {"message": "Notification deleted"}
