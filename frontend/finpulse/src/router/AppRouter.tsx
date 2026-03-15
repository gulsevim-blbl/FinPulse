import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import PortfolioPage from "../pages/PortfolioPage";
import WatchlistPage from "../pages/WatchlistPage";
import AlertsPage from "../pages/AlertsPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ProtectedAppLayout from "../layouts/ProtectedAppLayout";
import CoinDetailPage from "../pages/CoinDetailPage";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route element={<ProtectedAppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/portfolio" element={<PortfolioPage />} />
                    <Route path="/watchlist" element={<WatchlistPage />} />
                    <Route path="/alerts" element={<AlertsPage />} />
                    <Route path="/coin/:id" element={<CoinDetailPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
