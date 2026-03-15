from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.portfolio import (
    PortfolioItemCreate,
    PortfolioItemResponse,
    PortfolioItemListResponse,
    PortfolioSummary,
)
from app.services.portfolio_service import (
    create_portfolio_item,
    get_user_portfolio_items,
    delete_portfolio_item,
    refresh_portfolio_prices,
)

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.post("/items", response_model=PortfolioItemResponse, status_code=status.HTTP_201_CREATED)
def add_portfolio_item(
    item_data: PortfolioItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return create_portfolio_item(db, current_user.id, item_data)


@router.get("/items", response_model=PortfolioItemListResponse)
def list_portfolio_items(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items = get_user_portfolio_items(db, current_user.id)

    result = []
    for item in items:
        total_cost = item.quantity * item.average_buy_price
        current_value = item.quantity * item.current_price
        profit_loss = current_value - total_cost

        result.append(
            PortfolioSummary(
                id=item.id,
                symbol=item.symbol,
                quantity=item.quantity,
                average_buy_price=item.average_buy_price,
                current_price=item.current_price,
                total_cost=round(total_cost, 2),
                current_value=round(current_value, 2),
                profit_loss=round(profit_loss, 2),
            )
        )

    return {"items": result}


@router.post("/refresh-prices", status_code=status.HTTP_200_OK)
def refresh_prices(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    updated_symbols = refresh_portfolio_prices(db, current_user.id)

    return {
        "message": "Portfolio prices refreshed successfully",
        "updated_symbols": updated_symbols,
    }


@router.delete("/items/{item_id}", status_code=status.HTTP_200_OK)
def remove_portfolio_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    deleted_item = delete_portfolio_item(db, item_id, current_user.id)

    if not deleted_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio item not found",
        )

    return {"message": "Portfolio item deleted successfully"}