from app.domain.repositories.portfolio_repository import IPortfolioRepository
from app.schemas.portfolio import PortfolioItemCreate
from app.services.market_service import MarketService

class PortfolioService:
    def __init__(self, repo: IPortfolioRepository, market_service: MarketService):
        self.repo = repo
        self.market_service = market_service

    def create_portfolio_item(self, user_id: int, item_data: PortfolioItemCreate):
        current_price = self.market_service.get_coin_price_by_symbol(item_data.symbol)

        if current_price is None:
            return None

        return self.repo.create(
            user_id=user_id,
            symbol=item_data.symbol,
            quantity=item_data.quantity,
            average_buy_price=item_data.average_buy_price,
            current_price=current_price
        )

    def get_user_portfolio_items(self, user_id: int):
        return self.repo.get_user_items(user_id)

    def delete_portfolio_item(self, item_id: int, user_id: int):
        return self.repo.delete(item_id, user_id)

    def refresh_portfolio_prices(self, user_id: int):
        items = self.repo.get_user_items(user_id)
        symbol_price_map = {}
        
        for item in items:
            latest_price = self.market_service.get_coin_price_by_symbol(item.symbol)
            if latest_price is not None:
                symbol_price_map[item.symbol] = latest_price

        return self.repo.update_prices(user_id, symbol_price_map)