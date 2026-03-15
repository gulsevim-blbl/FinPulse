import { Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { useCurrentUser } from "../hooks/useCurrentUser";

export default function ProtectedAppLayout() {
    const token = localStorage.getItem("access_token");
    const { user, loading } = useCurrentUser();

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="rounded-2xl bg-white px-6 py-4 shadow">
                    Yükleniyor...
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <AppLayout fullName={user.full_name} />;
}
