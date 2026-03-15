import api from "./axios";

export interface PortfolioItemCreatePayload {
    symbol: string;
    quantity: number;
    average_buy_price: number;
}

export interface PortfolioItemSummary {
    id: number;
    symbol: string;
    quantity: number;
    average_buy_price: number;
    current_price: number;
    total_cost: number;
    current_value: number;
    profit_loss: number;
}

export interface PortfolioListResponse {
    items: PortfolioItemSummary[];
}

export const getPortfolioItems = async (): Promise<PortfolioListResponse> => {
    const response = await api.get("/portfolio/items");
    return response.data;
};

export const addPortfolioItem = async (payload: PortfolioItemCreatePayload) => {
    const response = await api.post("/portfolio/items", payload);
    return response.data;
};

export const refreshPortfolioPrices = async () => {
    const response = await api.post("/portfolio/refresh-prices");
    return response.data;
};

export const deletePortfolioItem = async (itemId: number) => {
    const response = await api.delete(`/portfolio/items/${itemId}`);
    return response.data;
};