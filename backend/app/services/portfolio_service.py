from sqlalchemy.orm import Session

from app.models.portfolio_item import PortfolioItem
from app.schemas.portfolio import PortfolioItemCreate
from app.services.market_service import get_coin_price_by_symbol


def create_portfolio_item(db: Session, user_id: int, item_data: PortfolioItemCreate):
    current_price = get_coin_price_by_symbol(item_data.symbol)

    if current_price is None:
        return None

    item = PortfolioItem(
        symbol=item_data.symbol,
        quantity=item_data.quantity,
        average_buy_price=item_data.average_buy_price,
        current_price=current_price,
        user_id=user_id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_user_portfolio_items(db: Session, user_id: int):
    return db.query(PortfolioItem).filter(PortfolioItem.user_id == user_id).all()


def delete_portfolio_item(db: Session, item_id: int, user_id: int):
    item = (
        db.query(PortfolioItem)
        .filter(PortfolioItem.id == item_id, PortfolioItem.user_id == user_id)
        .first()
    )

    if not item:
        return None

    db.delete(item)
    db.commit()
    return item


def refresh_portfolio_prices(db: Session, user_id: int):
    items = db.query(PortfolioItem).filter(PortfolioItem.user_id == user_id).all()

    updated_items = []

    for item in items:
        latest_price = get_coin_price_by_symbol(item.symbol)

        if latest_price is not None:
            item.current_price = latest_price
            updated_items.append(item.symbol)

    db.commit()
    return updated_items