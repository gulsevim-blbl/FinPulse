from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_alert_service
from app.schemas.alert import AlertCreate, AlertResponse, AlertCheckResult
from app.services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def add_alert(
    alert_data: AlertCreate,
    service: AlertService = Depends(get_alert_service),
    current_user=Depends(get_current_user),
):
    return service.create_alert(current_user.id, alert_data)


@router.get("", response_model=list[AlertResponse])
def list_alerts(
    service: AlertService = Depends(get_alert_service),
    current_user=Depends(get_current_user),
):
    return service.get_user_alerts(current_user.id)


@router.delete("/{alert_id}", status_code=status.HTTP_200_OK)
def remove_alert(
    alert_id: int,
    service: AlertService = Depends(get_alert_service),
    current_user=Depends(get_current_user),
):
    deleted_alert = service.delete_alert(alert_id, current_user.id)

    if not deleted_alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found",
        )

    return {"message": "Alert deleted successfully"}


@router.post("/check", response_model=list[AlertCheckResult])
def check_alerts(
    service: AlertService = Depends(get_alert_service),
    current_user=Depends(get_current_user),
):
    return service.check_user_alerts(current_user.id)