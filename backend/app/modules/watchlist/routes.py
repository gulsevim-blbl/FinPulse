from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user, get_watchlist_service
from app.schemas.watchlist import WatchlistItemCreate, WatchlistItemResponse
from app.services.watchlist_service import WatchlistService

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])


@router.post("/items", response_model=WatchlistItemResponse, status_code=status.HTTP_201_CREATED)
def add_watchlist_item(
    item_data: WatchlistItemCreate,
    service: WatchlistService = Depends(get_watchlist_service),
    current_user=Depends(get_current_user),
):
    item = service.create_watchlist_item(current_user.id, item_data)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coin already exists in watchlist",
        )

    return item


@router.get("/items", response_model=list[WatchlistItemResponse])
def list_watchlist_items(
    service: WatchlistService = Depends(get_watchlist_service),
    current_user=Depends(get_current_user),
):
    return service.get_user_watchlist_items(current_user.id)


@router.delete("/items/{item_id}", status_code=status.HTTP_200_OK)
def remove_watchlist_item(
    item_id: int,
    service: WatchlistService = Depends(get_watchlist_service),
    current_user=Depends(get_current_user),
):
    deleted_item = service.delete_watchlist_item(item_id, current_user.id)

    if not deleted_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist item not found",
        )

    return {"message": "Watchlist item deleted successfully"}