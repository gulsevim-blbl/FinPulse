import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, PieChart, Star, Bell, LogOut, Menu, X, Activity, Languages, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import ConfirmModal from "../components/ConfirmModal";
import NotificationCenter from "../components/NotificationCenter";

type AppLayoutProps = {
    fullName?: string;
};

export default function AppLayout({ fullName }: AppLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const { t, i18n } = useTranslation();

    const navItems = [
        { label: t("common.dashboard"), path: "/dashboard", icon: LayoutDashboard },
        { label: t("common.portfolio"), path: "/portfolio", icon: PieChart },
        { label: t("common.watchlist"), path: "/watchlist", icon: Star },
        { label: t("common.alerts"), path: "/alerts", icon: Bell },
    ];

    const toggleLanguage = () => {
        const newLang = i18n.language === "tr" ? "en" : "tr";
        i18n.changeLanguage(newLang);
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
            <div className="flex min-h-screen">
                {/* Mobile overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar */}
                <aside 
                    className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-white/10 bg-[#0B0F19]/90 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${
                        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className="border-b border-white/10 px-6 py-8 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Activity className="h-5 w-5 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-white">FinPulse</h1>
                            </div>
                            <p className="mt-2 pl-1 text-xs font-medium uppercase tracking-widest text-slate-400">
                                {t("common.cryptoPortfolio")}
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden rounded-lg p-2 text-slate-400 transition hover:bg-white/5 focus:outline-none"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="px-4 py-8 flex-1">
                        <nav className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;

                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => {
                                            navigate(item.path);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`group relative w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition-all duration-300 ${isActive
                                                ? "text-white bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <item.icon className={`h-5 w-5 transition-colors duration-300 ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-cyan-400"}`} />
                                        {isActive && (
                                            <motion.div 
                                                layoutId="active-indicator"
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full" 
                                            />
                                        )}
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="px-6 py-8 mt-auto">
                        <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-4 border border-cyan-500/10">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80 mb-1">FinPulse Pro</p>
                            <p className="text-xs text-slate-400 leading-relaxed">Piyasa verileri anlık olarak güncellenmektedir.</p>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col w-full min-w-0">
                    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-xl px-4 py-3 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="inline-flex rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none lg:hidden"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <h2 className="text-lg font-semibold text-white/90 tracking-tight hidden sm:block">
                                {t("common.adminPanel")}
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Notification Center */}
                            <NotificationCenter />

                            {/* Language Toggle */}
                            <button
                                onClick={toggleLanguage}
                                title={t("common.changeLanguage")}
                                className="flex h-10 items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 text-sm font-medium text-white transition-all hover:bg-white/10"
                            >
                                <Languages className="h-4 w-4 text-cyan-400" />
                                <span className="uppercase text-xs font-bold">{i18n.language.split("-")[0]}</span>
                            </button>

                            {/* Divider */}
                            <div className="h-6 w-px bg-white/10 hidden xs:block" />

                            {/* User Profile and Logout */}
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl pl-1 pr-1 py-1">
                                <div className="hidden md:flex flex-col items-end px-2">
                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500 leading-none mb-0.5">Giriş Yapan</span>
                                    <span className="text-xs font-bold text-white leading-none truncate max-w-[120px]">
                                        {fullName || t("common.user")}
                                    </span>
                                </div>
                                
                                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-cyan-400 shadow-inner md:order-first">
                                    {fullName ? fullName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                                </div>

                                <button
                                    onClick={() => setIsLogoutConfirmOpen(true)}
                                    title={t("common.logout")}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 transition-all hover:bg-rose-500 hover:text-white group"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
                        <Outlet />
                    </main>
                </div>
            </div>

            <ConfirmModal 
                isOpen={isLogoutConfirmOpen}
                onClose={() => setIsLogoutConfirmOpen(false)}
                onConfirm={handleLogout}
                title={t("common.logoutConfirm")}
                message={t("common.logoutMessage")}
                confirmText={t("common.logoutAction")}
            />
        </div>
    );
}
