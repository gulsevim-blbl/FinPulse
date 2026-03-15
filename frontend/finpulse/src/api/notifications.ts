import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export type Notification = {
    id: number;
    user_id: number;
    title: string;
    message: string;
    is_read: boolean;
    type: string;
    created_at: string;
};

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
});

export const getNotifications = async (): Promise<Notification[]> => {
    const response = await axios.get(`${API_URL}/notifications`, getAuthHeaders());
    return response.data;
};

export const markAsRead = async (id: number) => {
    await axios.post(`${API_URL}/notifications/${id}/read`, {}, getAuthHeaders());
};

export const markAllAsRead = async () => {
    await axios.post(`${API_URL}/notifications/read-all`, {}, getAuthHeaders());
};

export const deleteNotification = async (id: number) => {
    await axios.delete(`${API_URL}/notifications/${id}`, getAuthHeaders());
};
