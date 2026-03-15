import api from "./axios";

export interface WatchlistItemCreatePayload {
    symbol: string;
}

export interface WatchlistItem {
    id: number;
    symbol: string;
    user_id: number;
    created_at: string;
}

export const getWatchlistItems = async (): Promise<WatchlistItem[]> => {
    const response = await api.get("/watchlist/items");
    return response.data;
};

export const addWatchlistItem = async (payload: WatchlistItemCreatePayload) => {
    const response = await api.post("/watchlist/items", payload);
    return response.data;
};

export const deleteWatchlistItem = async (itemId: number) => {
    const response = await api.delete(`/watchlist/items/${itemId}`);
    return response.data;
};