from sqlalchemy.orm import Session

from app.models.watchlist_item import WatchlistItem
from app.schemas.watchlist import WatchlistItemCreate


def create_watchlist_item(db: Session, user_id: int, item_data: WatchlistItemCreate):
    existing_item = (
        db.query(WatchlistItem)
        .filter(
            WatchlistItem.user_id == user_id,
            WatchlistItem.symbol == item_data.symbol,
        )
        .first()
    )

    if existing_item:
        return None

    item = WatchlistItem(
        symbol=item_data.symbol,
        user_id=user_id,
    )

    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_user_watchlist_items(db: Session, user_id: int):
    return db.query(WatchlistItem).filter(WatchlistItem.user_id == user_id).all()


def delete_watchlist_item(db: Session, item_id: int, user_id: int):
    item = (
        db.query(WatchlistItem)
        .filter(
            WatchlistItem.id == item_id,
            WatchlistItem.user_id == user_id,
        )
        .first()
    )

    if not item:
        return None

    db.delete(item)
    db.commit()
    return item