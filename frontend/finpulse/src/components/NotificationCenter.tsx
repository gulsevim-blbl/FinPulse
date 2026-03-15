import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Trash2, Clock, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/useAppStore";
import { markAsRead, markAllAsRead, deleteNotification } from "../api/notifications";
import { toast } from "sonner";

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, fetchNotifications } = useAppStore();
    const { t } = useTranslation();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    useEffect(() => {
        fetchNotifications();
        // Polling every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            await markAsRead(id);
            fetchNotifications();
        } catch (error) {
            toast.error("Hata oluştu");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            fetchNotifications();
            toast.success(t("common.allMarkedRead"));
        } catch (error) {
            toast.error("Hata oluştu");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteNotification(id);
            fetchNotifications();
        } catch (error) {
            toast.error("Hata oluştu");
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg ring-2 ring-[#0B0F19]">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F19]/95 backdrop-blur-xl shadow-2xl z-[60]"
                    >
                        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">{t("common.notifications")}</h3>
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                    {unreadCount} {t("common.unreadMsg")}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleMarkAllRead}
                                    title={t("common.markAllRead")}
                                    className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                                    <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                                        <Inbox className="h-8 w-8 text-slate-600" />
                                    </div>
                                    <p className="text-slate-400 font-medium">{t("common.noNotifications")}</p>
                                    <p className="text-xs text-slate-500 mt-1">{t("common.noNotificationsDesc")}</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-4 transition-colors group relative ${n.is_read ? 'bg-transparent' : 'bg-cyan-500/[0.03]'}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 flex-shrink-0 h-2 w-2 rounded-full ${n.is_read ? 'bg-slate-700' : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'}`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-sm font-bold truncate ${n.is_read ? 'text-slate-400' : 'text-white'}`}>
                                                            {n.title}
                                                        </p>
                                                        <span className="text-[10px] text-slate-500 whitespace-nowrap flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className={`mt-1 text-xs leading-relaxed ${n.is_read ? 'text-slate-500' : 'text-slate-300'}`}>
                                                        {n.message}
                                                    </p>
                                                    <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!n.is_read && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(n.id)}
                                                                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-400/10 px-2 py-1 rounded-md"
                                                            >
                                                                {t("common.markAsRead")}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(n.id)}
                                                            className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors bg-rose-400/10 px-2 py-1 rounded-md"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                            {t("common.delete")}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-3 bg-white/[0.01] border-t border-white/5 text-center">
                                <p className="text-[10px] text-slate-500 font-medium italic">
                                    Alarmlar anlık olarak takip edilmektedir.
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
