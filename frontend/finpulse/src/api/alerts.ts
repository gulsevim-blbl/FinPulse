import api from "./axios";

export interface AlertCreatePayload {
    symbol: string;
    target_price: number;
    condition_type: "above" | "below";
}

export interface AlertItem {
    id: number;
    symbol: string;
    target_price: number;
    condition_type: "above" | "below";
    is_active: boolean;
    user_id: number;
    created_at: string;
}

export interface AlertCheckResult {
    alert_id: number;
    symbol: string;
    target_price: number;
    current_price: number;
    condition_type: "above" | "below";
    triggered: boolean;
}

export const getAlerts = async (): Promise<AlertItem[]> => {
    const response = await api.get("/alerts");
    return response.data;
};

export const addAlert = async (payload: AlertCreatePayload) => {
    const response = await api.post("/alerts", payload);
    return response.data;
};

export const deleteAlert = async (alertId: number) => {
    const response = await api.delete(`/alerts/${alertId}`);
    return response.data;
};

export const checkAlerts = async (): Promise<AlertCheckResult[]> => {
    const response = await api.post("/alerts/check");
    return response.data;
};