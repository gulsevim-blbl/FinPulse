from typing import List, Any, Optional
from sqlalchemy.orm import Session
from app.domain.repositories.watchlist_repository import IWatchlistRepository
from app.models.watchlist_item import WatchlistItem

class SQLAlchemyWatchlistRepository(IWatchlistRepository):
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, symbol: str) -> WatchlistItem:
        item = WatchlistItem(symbol=symbol, user_id=user_id)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def get_by_user_and_symbol(self, user_id: int, symbol: str) -> Optional[WatchlistItem]:
        return self.db.query(WatchlistItem).filter(
            WatchlistItem.user_id == user_id,
            WatchlistItem.symbol == symbol
        ).first()

    def get_user_items(self, user_id: int) -> List[WatchlistItem]:
        return self.db.query(WatchlistItem).filter(WatchlistItem.user_id == user_id).all()

    def delete(self, item_id: int, user_id: int) -> WatchlistItem:
        item = self.db.query(WatchlistItem).filter(
            WatchlistItem.id == item_id,
            WatchlistItem.user_id == user_id
        ).first()
        if item:
            self.db.delete(item)
            self.db.commit()
        return item
