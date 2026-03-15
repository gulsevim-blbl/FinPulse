from app.domain.repositories.watchlist_repository import IWatchlistRepository
from app.schemas.watchlist import WatchlistItemCreate

class WatchlistService:
    def __init__(self, repo: IWatchlistRepository):
        self.repo = repo

    def create_watchlist_item(self, user_id: int, item_data: WatchlistItemCreate):
        existing_item = self.repo.get_by_user_and_symbol(user_id, item_data.symbol)
        
        if existing_item:
            return None

        return self.repo.create(user_id=user_id, symbol=item_data.symbol)

    def get_user_watchlist_items(self, user_id: int):
        return self.repo.get_user_items(user_id)

    def delete_watchlist_item(self, item_id: int, user_id: int):
        return self.repo.delete(item_id, user_id)