import api from "./axios";

export interface RegisterPayload {
    full_name: string;
    email: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export const registerUser = async (payload: RegisterPayload) => {
    const response = await api.post("/auth/register", payload);
    return response.data;
};

export const loginUser = async (payload: LoginPayload) => {
    const formData = new URLSearchParams();
    formData.append("username", payload.email);
    formData.append("password", payload.password);

    const response = await api.post("/auth/login", formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    return response.data;
};

export const getMe = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};