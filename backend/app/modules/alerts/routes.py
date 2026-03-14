from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.alert import AlertCreate, AlertResponse, AlertCheckResult
from app.services.alert_service import (
    create_alert,
    get_user_alerts,
    delete_alert,
    check_user_alerts,
)

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def add_alert(
    alert_data: AlertCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return create_alert(db, current_user.id, alert_data)


@router.get("", response_model=list[AlertResponse])
def list_alerts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_user_alerts(db, current_user.id)


@router.delete("/{alert_id}", status_code=status.HTTP_200_OK)
def remove_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    deleted_alert = delete_alert(db, alert_id, current_user.id)

    if not deleted_alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )

    return {"message": "Alert deleted successfully"}


@router.post("/check", response_model=list[AlertCheckResult])
def check_alerts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return check_user_alerts(db, current_user.id)