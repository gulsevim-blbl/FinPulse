from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.watchlist import WatchlistItemCreate, WatchlistItemResponse
from app.services.watchlist_service import (
    create_watchlist_item,
    get_user_watchlist_items,
    delete_watchlist_item,
)

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])


@router.post("/items", response_model=WatchlistItemResponse, status_code=status.HTTP_201_CREATED)
def add_watchlist_item(
    item_data: WatchlistItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    item = create_watchlist_item(db, current_user.id, item_data)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coin already exists in watchlist",
        )

    return item


@router.get("/items", response_model=list[WatchlistItemResponse])
def list_watchlist_items(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_user_watchlist_items(db, current_user.id)


@router.delete("/items/{item_id}", status_code=status.HTTP_200_OK)
def remove_watchlist_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    deleted_item = delete_watchlist_item(db, item_id, current_user.id)

    if not deleted_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist item not found",
        )

    return {"message": "Watchlist item deleted successfully"}