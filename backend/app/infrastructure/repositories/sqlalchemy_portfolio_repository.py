from typing import List, Any
from sqlalchemy.orm import Session
from app.domain.repositories.portfolio_repository import IPortfolioRepository
from app.models.portfolio_item import PortfolioItem

class SQLAlchemyPortfolioRepository(IPortfolioRepository):
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, symbol: str, quantity: float, average_buy_price: float, current_price: float) -> PortfolioItem:
        item = PortfolioItem(
            symbol=symbol,
            quantity=quantity,
            average_buy_price=average_buy_price,
            current_price=current_price,
            user_id=user_id,
        )
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def get_user_items(self, user_id: int) -> List[PortfolioItem]:
        return self.db.query(PortfolioItem).filter(PortfolioItem.user_id == user_id).all()

    def get_item(self, item_id: int, user_id: int) -> PortfolioItem:
        return self.db.query(PortfolioItem).filter(
            PortfolioItem.id == item_id, 
            PortfolioItem.user_id == user_id
        ).first()

    def delete(self, item_id: int, user_id: int) -> PortfolioItem:
        item = self.get_item(item_id, user_id)
        if item:
            self.db.delete(item)
            self.db.commit()
        return item

    def update_prices(self, user_id: int, symbol_price_map: dict) -> List[str]:
        items = self.get_user_items(user_id)
        updated_symbols = []
        for item in items:
            if item.symbol in symbol_price_map:
                item.current_price = symbol_price_map[item.symbol]
                updated_symbols.append(item.symbol)
        self.db.commit()
        return updated_symbols
