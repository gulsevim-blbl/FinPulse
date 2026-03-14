from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.schemas.alert import AlertCreate
from app.services.market_service import get_coin_price_by_symbol


def create_alert(db: Session, user_id: int, alert_data: AlertCreate):
    alert = Alert(
        symbol=alert_data.symbol,
        target_price=alert_data.target_price,
        condition_type=alert_data.condition_type,
        user_id=user_id,
        is_active=True,
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def get_user_alerts(db: Session, user_id: int):
    return db.query(Alert).filter(Alert.user_id == user_id).all()


def delete_alert(db: Session, alert_id: int, user_id: int):
    alert = (
        db.query(Alert)
        .filter(Alert.id == alert_id, Alert.user_id == user_id)
        .first()
    )

    if not alert:
        return None

    db.delete(alert)
    db.commit()
    return alert


def check_user_alerts(db: Session, user_id: int):
    alerts = (
        db.query(Alert)
        .filter(Alert.user_id == user_id, Alert.is_active == True)
        .all()
    )

    results = []

    for alert in alerts:
        current_price = get_coin_price_by_symbol(alert.symbol)

        if current_price is None:
            continue

        triggered = False

        if alert.condition_type == "above" and current_price > alert.target_price:
            triggered = True
        elif alert.condition_type == "below" and current_price < alert.target_price:
            triggered = True

        if triggered:
            alert.is_active = False

        results.append(
            {
                "alert_id": alert.id,
                "symbol": alert.symbol,
                "target_price": alert.target_price,
                "current_price": current_price,
                "condition_type": alert.condition_type,
                "triggered": triggered,
            }
        )

    db.commit()
    return results